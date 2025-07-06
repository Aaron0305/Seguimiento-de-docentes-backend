#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Tracks database query performance, memory usage, and response times
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      queries: [],
      memory: [],
      responseTime: [],
      cacheHits: 0,
      cacheMisses: 0
    };
    this.startTime = Date.now();
  }

  /**
   * Monitor database queries
   */
  setupDatabaseMonitoring() {
    // Enable MongoDB profiling for slow queries
    mongoose.set('debug', (collectionName, method, query, doc) => {
      const start = Date.now();
      
      // Log slow queries (> 100ms)
      setTimeout(() => {
        const duration = Date.now() - start;
        if (duration > 100) {
          console.warn(`🐌 Slow Query Detected:`, {
            collection: collectionName,
            method: method,
            duration: `${duration}ms`,
            query: JSON.stringify(query)
          });
          
          this.metrics.queries.push({
            collection: collectionName,
            method: method,
            duration: duration,
            timestamp: new Date()
          });
        }
      }, 0);
    });
  }

  /**
   * Monitor memory usage
   */
  setupMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memory.push({
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        timestamp: new Date()
      });

      // Keep only last 100 entries
      if (this.metrics.memory.length > 100) {
        this.metrics.memory = this.metrics.memory.slice(-100);
      }

      // Warn if memory usage is high
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      if (heapUsedMB > 200) {
        console.warn(`⚠️ High Memory Usage: ${Math.round(heapUsedMB)}MB`);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Express middleware for response time monitoring
   */
  responseTimeMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        
        this.metrics.responseTime.push({
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: duration,
          timestamp: new Date()
        });

        // Keep only last 1000 entries
        if (this.metrics.responseTime.length > 1000) {
          this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
        }

        // Warn about slow responses
        if (duration > 1000) {
          console.warn(`🐌 Slow Response: ${req.method} ${req.url} - ${duration}ms`);
        }
      });
      
      next();
    };
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const uptime = Date.now() - this.startTime;
    const uptimeHours = Math.round(uptime / 1000 / 60 / 60 * 100) / 100;

    console.log('\n📊 PERFORMANCE REPORT');
    console.log('=' .repeat(50));
    
    // Uptime
    console.log(`⏱️  Uptime: ${uptimeHours} hours`);
    
    // Memory Stats
    if (this.metrics.memory.length > 0) {
      const latestMemory = this.metrics.memory[this.metrics.memory.length - 1];
      const avgMemory = this.metrics.memory.reduce((sum, m) => sum + m.heapUsed, 0) / this.metrics.memory.length;
      
      console.log(`🧠 Memory Usage:`);
      console.log(`   Current: ${latestMemory.heapUsed}MB`);
      console.log(`   Average: ${Math.round(avgMemory)}MB`);
      console.log(`   RSS: ${latestMemory.rss}MB`);
    }

    // Response Time Stats
    if (this.metrics.responseTime.length > 0) {
      const avgResponseTime = this.metrics.responseTime.reduce((sum, r) => sum + r.duration, 0) / this.metrics.responseTime.length;
      const maxResponseTime = Math.max(...this.metrics.responseTime.map(r => r.duration));
      const slowRequests = this.metrics.responseTime.filter(r => r.duration > 500).length;
      
      console.log(`⚡ Response Times:`);
      console.log(`   Average: ${Math.round(avgResponseTime)}ms`);
      console.log(`   Max: ${maxResponseTime}ms`);
      console.log(`   Slow requests (>500ms): ${slowRequests}`);
      console.log(`   Total requests: ${this.metrics.responseTime.length}`);
    }

    // Database Query Stats
    if (this.metrics.queries.length > 0) {
      const avgQueryTime = this.metrics.queries.reduce((sum, q) => sum + q.duration, 0) / this.metrics.queries.length;
      const slowestQuery = this.metrics.queries.sort((a, b) => b.duration - a.duration)[0];
      
      console.log(`💾 Database Queries:`);
      console.log(`   Slow queries (>100ms): ${this.metrics.queries.length}`);
      console.log(`   Average slow query time: ${Math.round(avgQueryTime)}ms`);
      console.log(`   Slowest query: ${slowestQuery.duration}ms (${slowestQuery.collection}.${slowestQuery.method})`);
    }

    // Cache Stats (if implemented)
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (totalCacheRequests > 0) {
      const hitRate = (this.metrics.cacheHits / totalCacheRequests * 100).toFixed(1);
      console.log(`🗄️  Cache Performance:`);
      console.log(`   Hit rate: ${hitRate}%`);
      console.log(`   Hits: ${this.metrics.cacheHits}`);
      console.log(`   Misses: ${this.metrics.cacheMisses}`);
    }

    console.log('=' .repeat(50));
  }

  /**
   * Start monitoring
   */
  start() {
    console.log('🔍 Performance monitoring started');
    this.setupDatabaseMonitoring();
    this.setupMemoryMonitoring();

    // Generate report every 5 minutes
    setInterval(() => {
      this.generateReport();
    }, 5 * 60 * 1000);

    // Generate final report on exit
    process.on('SIGINT', () => {
      console.log('\n🏁 Generating final performance report...');
      this.generateReport();
      process.exit(0);
    });
  }

  /**
   * Track cache performance
   */
  trackCacheHit() {
    this.metrics.cacheHits++;
  }

  trackCacheMiss() {
    this.metrics.cacheMisses++;
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;