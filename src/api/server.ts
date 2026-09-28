import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MetricsController } from './controllers/metricsController';
import { ReportsController } from './controllers/reportsController';

dotenv.config();

export const app: Express = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health Check Endpoint (Required by Docker Compose health check & Core Requirement 8)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Metrics Endpoints
app.get('/api/metrics', MetricsController.getMetrics);
app.post('/api/metrics/reset', MetricsController.resetMetrics);

// Reports Endpoints
app.get('/api/reports', ReportsController.listReports);
app.get('/api/reports/:id/generate', ReportsController.generateReport);

// Fallback 404 for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
