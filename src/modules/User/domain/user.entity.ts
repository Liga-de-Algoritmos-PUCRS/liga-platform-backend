import { createId } from "@paralleldrive/cuid2";

export type Role = "USER" | "ADMIN";
export type Course =
  | "SOFTWARE_ENGINEERING"
  | "DATA_SCIENCE"
  | "COMPUTING_SCIENCE"
  | "INFORMATION_SYSTEMS"
  | "COMPUTING_ENGINEERING";

export type Semester =
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "FOURTH"
  | "FIFTH"
  | "SIXTH"
  | "SEVENTH"
  | "EIGHTH"
  | "NINTH"
  | "TENTH"
  | "GRADUATED";
export interface UserInterface {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  role: Role;
  course: Course;
  semester: Semester;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
  historycalSubmissions?: number;
  monthlyPoints?: number;
  allTimePoints?: number;
}

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  bannerUrl: string | null;
  avatarUrl: string | null;
  role: Role;
  course: Course;
  semester: Semester;
  monthlyPoints?: number;
  allTimePoints?: number;
  historycalSubmissions?: number;

  constructor(user: UserInterface, id?: string) {
    this.id = id ?? createId();
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.createdAt = user.createdAt ?? new Date();
    this.bannerUrl = user.bannerUrl ?? null;
    this.avatarUrl = user.avatarUrl ?? null;
    this.role = user.role;
    this.course = user.course;
    this.semester = user.semester;
    this.monthlyPoints = user.monthlyPoints ?? 0;
    this.allTimePoints = user.allTimePoints ?? 0;
    this.historycalSubmissions = user.historycalSubmissions ?? 0;
  }

  public toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      role: this.role,
      bannerUrl: this.bannerUrl,
      avatarUrl: this.avatarUrl,
      course: this.course,
      semester: this.semester,
    };
  }
}
