// ErgoSphere Robust Data Loading Status Check
// This script provides utilities to check the status of the robust data loading system

class DataLoadingStatusChecker {
    constructor() {
        this.endpoints = {
            ergoShop: '/api/ergoshop',
            ergoBazaarMovies: '/api/ergobazaar/movies',
            ergoBazaarSingleplayer: '/api/ergobazaar/singleplayer',
            ergoBazaarPvp: '/api/ergobazaar/pvp',
            ergoBazaarCoop: '/api/ergobazaar/coop',
            ergoBazaarLoot: '/api/ergobazaar/loot',
            ergoBazaarYoutube: '/api/ergobazaar/youtube',
            ergoBazaarAnime: '/api/ergobazaar/anime',
            ergoBazaarSundayMorning: '/api/ergobazaar/sundaymorning',
            ergoBazaarSundayNight: '/api/ergobazaar/sundaynight',
            serverStatus: '/api/status',
            backupErgoShop: '/api/backup/ErgoShop',
            fallbackErgoShop: '/api/fallback/ErgoShop'
        };
        
        this.results = {};
    }
    
    async checkAllEndpoints() {
        console.log('🔍 Checking all robust data loading endpoints...');
        
        const results = {};
        
        for (const [name, endpoint] of Object.entries(this.endpoints)) {
            try {
                const start = performance.now();
                const response = await fetch(endpoint);
                const end = performance.now();
                const responseTime = Math.round(end - start);
                
                const source = response.headers.get('X-Data-Source') || 'server';
                const status = response.ok ? 'success' : 'error';
                
                results[name] = {
                    status,
                    statusCode: response.status,
                    responseTime,
                    source,
                    endpoint
                };
                
                if (response.ok) {
                    console.log(`✅ ${name}: ${response.status} (${responseTime}ms) [${source}]`);
                } else {
                    console.warn(`⚠️ ${name}: ${response.status} (${responseTime}ms)`);
                }
                
            } catch (error) {
                results[name] = {
                    status: 'error',
                    error: error.message,
                    endpoint
                };
                console.error(`❌ ${name}: ${error.message}`);
            }
        }
        
        this.results = results;
        return results;
    }
    
    generateReport() {
        const total = Object.keys(this.results).length;
        const successful = Object.values(this.results).filter(r => r.status === 'success').length;
        const failed = total - successful;
        
        const report = {
            summary: {
                total,
                successful,
                failed,
                successRate: Math.round((successful / total) * 100)
            },
            details: this.results,
            timestamp: new Date().toISOString()
        };
        
        console.log(`📊 Status Report: ${successful}/${total} endpoints working (${report.summary.successRate}%)`);
        
        return report;
    }
    
    async testFallbackChain(category = 'ErgoShop') {
        console.log(`🔗 Testing fallback chain for ${category}...`);
        
        const fallbackTests = [
            { name: 'Primary', url: `/api/ergoshop` },
            { name: 'Backup', url: `/api/backup/${category}` },
            { name: 'Fallback', url: `/api/fallback/${category}` }
        ];
        
        const results = [];
        
        for (const test of fallbackTests) {
            try {
                const response = await fetch(test.url);
                const source = response.headers.get('X-Data-Source') || 'unknown';
                
                results.push({
                    name: test.name,
                    status: response.ok ? 'success' : 'error',
                    statusCode: response.status,
                    source
                });
                
                console.log(`${response.ok ? '✅' : '❌'} ${test.name}: ${response.status} [${source}]`);
                
            } catch (error) {
                results.push({
                    name: test.name,
                    status: 'error',
                    error: error.message
                });
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        return results;
    }
}

// Global status checker instance
window.DataLoadingStatusChecker = DataLoadingStatusChecker;

// Convenience function for quick checks
window.checkDataLoadingStatus = async () => {
    const checker = new DataLoadingStatusChecker();
    await checker.checkAllEndpoints();
    return checker.generateReport();
};

console.log('📋 Data Loading Status Checker loaded. Use checkDataLoadingStatus() for quick checks.');
