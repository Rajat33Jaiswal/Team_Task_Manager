import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const myTasks = searchParams.get('myTasks'); // If true, get only tasks assigned to current user

    const where = {};
    
    if (projectId) where.projectId = projectId;
    if (myTasks === 'true' || session.user.role !== 'ADMIN') {
      // Members can only see their own tasks
      where.assigneeId = session.user.id;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, priority, dueDate, projectId, assigneeId } = body;

    if (!title || !projectId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
