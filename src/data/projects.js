export const projects = [
  {
    slug: "training-dashboard",
    name: "Training Dashboard",
    stack: "Python · React · PostgreSQL",
    description:
      "Internal dashboard to track training progress, shifts, and performance metrics.",
    github: "https://github.com/DyslexicLemons/Training-Schedule",
    demo: "",
  },
  {
    slug: "pharmacy-workflow-app",
    name: "Full-Stack Pharmacy Platform",
    stack: "React/TypeScript · FastAPI · PostgreSQL · AWS · Terraform",
    description:
      "Full-stack pharmacy app with a state workflow for prescriptions, JWT auth, three-tier RBAC, and Redis caching. AWS infrastructure provisioned via Terraform (ECS Fargate, RDS, CloudFront, ALB). CI/CD via GitHub Actions with parallel test jobs, Docker image builds, and CDN cache invalidation. Async task system using Celery with Beat scheduler for prescription expiration and refill scheduling.",
    github: "https://github.com/DyslexicLemons/PharmacyApp",
    demo: "",
    detailPath: "/projects/pharmacy-workflow-app",
  },
  {
    slug: "todo-app",
    name: "Todo App",
    stack: "Angular · Node.js/Express · MongoDB · Docker",
    description:
      "Gamified task manager that organizes to-dos by estimated duration (Quick/Small/Medium/Long-Term) instead of due dates, with per-task streak tracking and motivational nudges to reduce friction.",
    github: "https://github.com/DyslexicLemons/TodoApp",
    demo: "",
    detailPath: "/projects/todo-app",
  },
];
