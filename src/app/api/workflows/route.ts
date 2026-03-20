import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/workflows - Get all workflows for a user
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

    const workflows = await db.workflow.findMany({
      where: { userId: ownerId },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data
    const transformedWorkflows = workflows.map((workflow) => ({
      ...workflow,
      actions: workflow.actions ? JSON.parse(workflow.actions) : [],
      triggerConfig: workflow.triggerConfig ? JSON.parse(workflow.triggerConfig) : null,
      eventTypeIds: workflow.eventTypeIds ? JSON.parse(workflow.eventTypeIds) : null,
    }));

    return NextResponse.json({ success: true, data: transformedWorkflows });
  } catch (error) {
    console.error('Get workflows error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, isActive, triggerType, triggerConfig, actions, eventTypeIds } = body;

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

    const workflow = await db.workflow.create({
      data: {
        userId: ownerId,
        name,
        description,
        isActive: isActive ?? true,
        triggerType,
        triggerConfig: triggerConfig ? JSON.stringify(triggerConfig) : null,
        actions: JSON.stringify(actions || []),
        eventTypeIds: eventTypeIds ? JSON.stringify(eventTypeIds) : null,
      },
    });

    const transformedWorkflow = {
      ...workflow,
      actions: JSON.parse(workflow.actions),
      triggerConfig: workflow.triggerConfig ? JSON.parse(workflow.triggerConfig) : null,
      eventTypeIds: workflow.eventTypeIds ? JSON.parse(workflow.eventTypeIds) : null,
    };

    return NextResponse.json({ success: true, data: transformedWorkflow });
  } catch (error) {
    console.error('Create workflow error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// PUT /api/workflows - Update a workflow
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, actions, triggerConfig, eventTypeIds, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...data };
    if (actions !== undefined) {
      updateData.actions = JSON.stringify(actions);
    }
    if (triggerConfig !== undefined) {
      updateData.triggerConfig = triggerConfig ? JSON.stringify(triggerConfig) : null;
    }
    if (eventTypeIds !== undefined) {
      updateData.eventTypeIds = eventTypeIds ? JSON.stringify(eventTypeIds) : null;
    }

    const workflow = await db.workflow.update({
      where: { id },
      data: updateData,
    });

    const transformedWorkflow = {
      ...workflow,
      actions: JSON.parse(workflow.actions),
      triggerConfig: workflow.triggerConfig ? JSON.parse(workflow.triggerConfig) : null,
      eventTypeIds: workflow.eventTypeIds ? JSON.parse(workflow.eventTypeIds) : null,
    };

    return NextResponse.json({ success: true, data: transformedWorkflow });
  } catch (error) {
    console.error('Update workflow error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows - Delete a workflow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    await db.workflow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
