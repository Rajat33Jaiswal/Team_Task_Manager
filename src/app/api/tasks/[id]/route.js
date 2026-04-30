import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, title, description, priority, dueDate, assigneeId, rating } = body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return NextResponse.json({ message: 'Task not found' }, { status: 404 });

    // Members can only update the status of their assigned tasks
    if (session.user.role !== 'ADMIN') {
      if (existingTask.assigneeId !== session.user.id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status }
      });
      return NextResponse.json({ task: updatedTask });
    }

    // Admins can update anything EXCEPT status
    // If rating is provided and < 2, reassign task
    let updateData = {
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      priority: priority !== undefined ? priority : existingTask.priority,
      dueDate: dueDate !== undefined ? new Date(dueDate) : existingTask.dueDate,
      assigneeId: assigneeId !== undefined ? assigneeId : existingTask.assigneeId,
      rating: rating !== undefined ? rating : existingTask.rating,
    };

    if (rating !== undefined && rating < 2 && existingTask.status === 'COMPLETED') {
      // Find another member to reassign
      const otherMembers = await prisma.user.findMany({
        where: {
          role: 'MEMBER',
          id: { not: existingTask.assigneeId }
        }
      });

      if (otherMembers.length > 0) {
        const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        updateData.assigneeId = randomMember.id;
        updateData.status = 'PENDING';
        updateData.rating = null; // Reset rating for new assignee
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
