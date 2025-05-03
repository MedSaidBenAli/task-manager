import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TaskService, Task } from '../task.service';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { TaskFilterPipe } from '../../pipes/task-filter.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TaskFilterPipe
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  currentUser: any;
  filter: 'all' | 'completed' | 'incomplete' = 'all';

  searchInput: string = '';     // Ce que tape l'utilisateur
  searchTitle: string = '';     // Appliqué au filtre

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Tâches récupérées:', tasks);
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    });
  }

  deleteTask(id: string | number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  toggleTaskStatus(task: Task): void {
    if (!task.id) return;
    
    const updatedTask = {
      ...task,
      completed: !task.completed
    };

    this.taskService.updateTask(task.id, updatedTask).subscribe({
      next: () => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      if (this.filter === 'completed') return task.completed;
      if (this.filter === 'incomplete') return !task.completed;
      return true;
    });
  }

  onSearch(): void {
    this.searchTitle = this.searchInput.trim().toLowerCase();
  }
}
