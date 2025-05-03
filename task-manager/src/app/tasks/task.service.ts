import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

// Modèle de tâche (tu peux aussi créer un fichier `task.model.ts`)
export interface Task {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks'; // json-server endpoint

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  // Récupérer toutes les tâches de l'utilisateur connecté
  getTasks(): Observable<Task[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    console.log('Récupération des tâches pour l\'utilisateur:', currentUser.id);
    return this.http.get<Task[]>(`${this.apiUrl}?userId=${currentUser.id}`).pipe(
      map(tasks => {
        console.log('Tâches récupérées:', tasks);
        return tasks;
      })
    );
  }

  // Récupérer une tâche par ID
  getTaskById(id: string | number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // Récupérer le prochain ID disponible
  private getNextTaskId(): Observable<string> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map(tasks => {
        // Générer un ID alphanumérique unique
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 6);
        return `task_${timestamp}_${random}`;
      })
    );
  }

  // Ajouter une tâche
  addTask(task: Task): Observable<Task> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    return this.getNextTaskId().pipe(
      switchMap(nextId => {
        const taskWithUser = {
          ...task,
          id: nextId,
          userId: currentUser.id,
          createdAt: new Date().toISOString()
        };
        return this.http.post<Task>(this.apiUrl, taskWithUser);
      })
    );
  }

  // Modifier une tâche
  updateTask(id: string | number, task: Task): Observable<Task> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Utilisateur non connecté');
    }
    const taskWithUser = {
      ...task,
      userId: currentUser.id
    };
    return this.http.put<Task>(`${this.apiUrl}/${id}`, taskWithUser);
  }

  // Supprimer une tâche
  deleteTask(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
