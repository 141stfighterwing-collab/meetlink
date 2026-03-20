import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/contact-groups - Get all contact groups for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get demo user if userId not provided
    let ownerId = userId;
    if (!ownerId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ success: true, data: [] });
      }
      ownerId = user.id;
    }

    const groups = await db.contactGroup.findMany({
      where: { userId: ownerId },
      include: {
        members: {
          include: {
            contact: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform to include member count
    const transformedGroups = groups.map((group) => ({
      ...group,
      memberCount: group.members.length,
      members: group.members.map((m) => m.contact),
    }));

    return NextResponse.json({ success: true, data: transformedGroups });
  } catch (error) {
    console.error('Get contact groups error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact groups' },
      { status: 500 }
    );
  }
}

// POST /api/contact-groups - Create a new contact group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, color, contactIds } = body;

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

    const group = await db.contactGroup.create({
      data: {
        userId: ownerId,
        name,
        description,
        color: color || '#6B7280',
        members: contactIds
          ? {
              create: contactIds.map((contactId: string) => ({
                contactId,
              })),
            }
          : undefined,
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    console.error('Create contact group error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contact group' },
      { status: 500 }
    );
  }
}

// PUT /api/contact-groups - Update a contact group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contact group ID is required' },
        { status: 400 }
      );
    }

    const group = await db.contactGroup.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    console.error('Update contact group error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update contact group' },
      { status: 500 }
    );
  }
}

// DELETE /api/contact-groups - Delete a contact group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contact group ID is required' },
        { status: 400 }
      );
    }

    await db.contactGroup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Contact group deleted' });
  } catch (error) {
    console.error('Delete contact group error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contact group' },
      { status: 500 }
    );
  }
}
