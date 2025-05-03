import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService, Task } from '../task.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEdit = false;
  taskId: string | number = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      completed: [false]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.taskId = id;
        this.loadTask(id);
      }
    });
  }

  loadTask(id: string | number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        // Vérifier que la tâche appartient à l'utilisateur connecté
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || task.userId !== currentUser.id) {
          this.router.navigate(['/tasks']);
          return;
        }
        this.taskForm.patchValue(task);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la tâche:', error);
        this.router.navigate(['/tasks']);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const task: Task = {
      ...this.taskForm.value,
      userId: currentUser.id
    };

    if (this.isEdit && this.taskId) {
      this.taskService.updateTask(this.taskId, task).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
        }
      });
    } else {
      this.taskService.addTask(task).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
        }
      });
    }
  }
}
