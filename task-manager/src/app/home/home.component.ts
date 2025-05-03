import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../auth/auth.service';
import { TaskService, Task } from '../tasks/task.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user: User | null;
  tasks: Task[] = [];

  constructor(private authService: AuthService, private taskService: TaskService) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(data => {
      this.tasks = data;
    });
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  get inProgressTasks(): number {
    return this.tasks.filter(t => !t.completed).length;
  }
}
