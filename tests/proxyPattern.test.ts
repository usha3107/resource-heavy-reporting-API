import request from 'supertest';
import { app } from '../src/api/server';
import { MetricsTracker } from '../src/core/MetricsTracker';
import { HeavyReportGenerator } from '../src/core/HeavyReportGenerator';
import { VirtualReportProxy } from '../src/proxies/VirtualReportProxy';
import { ProtectionReportProxy, AccessDeniedError } from '../src/proxies/ProtectionReportProxy';

describe('Resource-Heavy Reporting API & Proxy Pattern Tests', () => {
  beforeEach(async () => {
    // Reset state before each test
    await request(app).post('/api/metrics/reset');
  });

  describe('Core Requirement 1: Metrics Tracking System', () => {
    it('should return total_instantiations equal to 0 on clean startup', async () => {
      const response = await request(app).get('/api/metrics');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ total_instantiations: 0 });
    });
  });

  describe('Core Requirement 2: List Reports Endpoint & Lazy Behavior', () => {
    it('should return exactly three seeded reports without triggering instantiations', async () => {
      const reportsResponse = await request(app).get('/api/reports');
      expect(reportsResponse.status).toBe(200);
      expect(reportsResponse.body).toHaveLength(3);
      expect(reportsResponse.body).toEqual([
        { id: 'report-1', title: 'Financial Q1', required_role: 'admin' },
        { id: 'report-2', title: 'User Analytics', required_role: 'manager' },
        { id: 'report-3', title: 'System Status', required_role: 'guest' }
      ]);

      const metricsResponse = await request(app).get('/api/metrics');
      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body).toEqual({ total_instantiations: 0 });
    });
  });

  describe('Core Requirement 3: Generate Report & First-Time Instantiation', () => {
    it('should instantiate HeavyReportGenerator on first generate call and increment metric', async () => {
      const genResponse = await request(app).get('/api/reports/report-3/generate?role=guest');
      expect(genResponse.status).toBe(200);
      expect(genResponse.body).toEqual({
        id: 'report-3',
        content: 'Report content for System Status'
      });

      const metricsResponse = await request(app).get('/api/metrics');
      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body).toEqual({ total_instantiations: 1 });
    });
  });

  describe('Core Requirement 4: Virtual Proxy Caching', () => {
    it('should reuse existing instance on subsequent calls and not increment total_instantiations', async () => {
      // First generation
      await request(app).get('/api/reports/report-3/generate?role=guest');
      let metrics = await request(app).get('/api/metrics');
      expect(metrics.body.total_instantiations).toBe(1);

      // Subsequent 3 calls
      for (let i = 0; i < 3; i++) {
        const res = await request(app).get('/api/reports/report-3/generate?role=guest');
        expect(res.status).toBe(200);
      }

      metrics = await request(app).get('/api/metrics');
      expect(metrics.body.total_instantiations).toBe(1);
    });
  });

  describe('Core Requirement 5: Protection Proxy Access Denied', () => {
    it('should reject unauthorized role with 403 Forbidden and NOT instantiate heavy subject', async () => {
      // report-1 requires admin, query with role=guest
      const response = await request(app).get('/api/reports/report-1/generate?role=guest');
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Access Denied' });

      const metrics = await request(app).get('/api/metrics');
      expect(metrics.body.total_instantiations).toBe(0);
    });
  });

  describe('Core Requirement 6: Protection Proxy Access Granted', () => {
    it('should allow authorized role and pass call to Virtual Proxy for instantiation', async () => {
      // report-1 requires admin, query with role=admin
      const response = await request(app).get('/api/reports/report-1/generate?role=admin');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 'report-1',
        content: 'Report content for Financial Q1'
      });

      const metrics = await request(app).get('/api/metrics');
      expect(metrics.body.total_instantiations).toBe(1);
    });
  });

  describe('Core Requirement 7: Metrics Reset Utility', () => {
    it('should reset metrics counter back to 0 on POST /api/metrics/reset', async () => {
      await request(app).get('/api/reports/report-3/generate?role=guest');
      let metrics = await request(app).get('/api/metrics');
      expect(metrics.body.total_instantiations).toBe(1);

      const resetRes = await request(app).post('/api/metrics/reset');
      expect(resetRes.status).toBe(200);
      expect(resetRes.body).toEqual({ message: 'Metrics reset successfully' });

      metrics = await request(app).get('/api/metrics');
      expect(metrics.body.total_instantiations).toBe(0);
    });
  });

  describe('Core Requirement 10: Handling Non-Existent Reports', () => {
    it('should return 404 Not Found when generating a non-existent report', async () => {
      const response = await request(app).get('/api/reports/non-existent-report/generate?role=admin');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Report not found' });
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 OK on GET /health', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Unit Tests: Direct Pattern Implementations', () => {
    it('VirtualReportProxy should delay HeavyReportGenerator creation until generate() call', () => {
      const virtualProxy = new VirtualReportProxy('unit-1', 'Unit Report', 'admin');
      expect(virtualProxy.isInstantiated()).toBe(false);
      expect(virtualProxy.getTitle()).toBe('Unit Report');
      expect(virtualProxy.isInstantiated()).toBe(false);

      const content = virtualProxy.generate('admin');
      expect(content).toBe('Report content for Unit Report');
      expect(virtualProxy.isInstantiated()).toBe(true);
    });

    it('ProtectionReportProxy should throw AccessDeniedError when role is insufficient', () => {
      const virtualProxy = new VirtualReportProxy('unit-2', 'Secret Report', 'admin');
      const protectedProxy = new ProtectionReportProxy(virtualProxy, 'admin');

      expect(() => protectedProxy.generate('guest')).toThrow(AccessDeniedError);
      expect(virtualProxy.isInstantiated()).toBe(false);
    });
  });
});
