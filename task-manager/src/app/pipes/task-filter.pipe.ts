import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../tasks/task.service';

@Pipe({
  name: 'taskFilter',
  standalone: true
})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: Task[], searchTerm: string): Task[] {
    if (!searchTerm) return tasks;
    const lower = searchTerm.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lower) ||
      task.description.toLowerCase().includes(lower)
    );
  }
}
