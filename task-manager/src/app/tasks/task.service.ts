import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

// Modèle de tâche (tu peux aussi créer un fichier `task.model.ts`)
export interface Task {
  id?: string | number;
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
  private getNextTaskId(): Observable<string | number> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map(tasks => {
        // Trouver le plus grand ID numérique
        const numericIds = tasks.map(task => {
          if (!task.id) return 0;
          const id = typeof task.id === 'string' ? parseInt(task.id, 10) : task.id;
          return isNaN(id) ? 0 : id;
        });
        const maxNumericId = Math.max(...numericIds, 0);
        
        // Si tous les IDs sont numériques, retourner le prochain nombre
        if (tasks.every(task => !task.id || typeof task.id === 'number' || !isNaN(parseInt(task.id, 10)))) {
          return maxNumericId + 1;
        }
        
        // Sinon, générer un ID alphanumérique
        return Math.random().toString(36).substring(2, 6);
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
