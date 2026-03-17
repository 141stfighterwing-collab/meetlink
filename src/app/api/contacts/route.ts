import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/contacts - Get all contacts for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const groupId = searchParams.get('groupId');

    // Get demo user if userId not provided
    let ownerId = userId;
    if (!ownerId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ success: true, data: [] });
      }
      ownerId = user.id;
    }

    const where: Record<string, unknown> = { userId: ownerId };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }

    if (groupId) {
      where.groups = { some: { groupId } };
    }

    const contacts = await db.contact.findMany({
      where,
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Transform the data to include groups array
    const transformedContacts = contacts.map((contact) => ({
      ...contact,
      groups: contact.groups.map((g) => g.group),
      tags: contact.tags ? JSON.parse(contact.tags) : [],
    }));

    return NextResponse.json({ success: true, data: transformedContacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      website,
      linkedin,
      twitter,
      notes,
      tags,
      groupIds,
      source,
    } = body;

    // Get demo user if userId not provided
    let ownerId = userId;
    if (!ownerId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No user found' },
          { status: 400 }
        );
      }
      ownerId = user.id;
    }

    const contact = await db.contact.create({
      data: {
        userId: ownerId,
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        website,
        linkedin,
        twitter,
        notes,
        tags: tags ? JSON.stringify(tags) : null,
        source: source || 'MANUAL',
        groups: groupIds
          ? {
              create: groupIds.map((groupId: string) => ({
                groupId,
              })),
            }
          : undefined,
      },
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    const transformedContact = {
      ...contact,
      groups: contact.groups.map((g) => g.group),
      tags: contact.tags ? JSON.parse(contact.tags) : [],
    };

    return NextResponse.json({ success: true, data: transformedContact });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// PUT /api/contacts - Update a contact
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, groupIds, tags, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...data };
    if (tags) {
      updateData.tags = JSON.stringify(tags);
    }

    // Update contact
    const contact = await db.contact.update({
      where: { id },
      data: updateData,
    });

    // Update groups if provided
    if (groupIds !== undefined) {
      // Remove existing group memberships
      await db.contactGroupMembership.deleteMany({
        where: { contactId: id },
      });

      // Add new group memberships
      if (groupIds.length > 0) {
        await db.contactGroupMembership.createMany({
          data: groupIds.map((groupId: string) => ({
            contactId: id,
            groupId,
          })),
        });
      }
    }

    // Fetch updated contact with groups
    const updatedContact = await db.contact.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    const transformedContact = updatedContact
      ? {
          ...updatedContact,
          groups: updatedContact.groups.map((g) => g.group),
          tags: updatedContact.tags ? JSON.parse(updatedContact.tags) : [],
        }
      : null;

    return NextResponse.json({ success: true, data: transformedContact });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts - Delete a contact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    await db.contact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
