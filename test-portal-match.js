/**
 * Portal Template Comparison Test
 * Validates our generated template matches portal-generated template structure
 */

const fs = require('fs');
const path = require('path');

console.log('=== Portal Template Comparison Test ===\n');

// Portal template structure expectations
const portalExpectations = {
    connectedCluster: {
        apiVersion: '2025-08-01-preview',
        type: 'Microsoft.Kubernetes/ConnectedClusters',
        hasAdminGroupObjectIDs: true,
        hasEnableAzureRBAC: true
    },
    provisionedCluster: {
        apiVersion: '2024-01-01',
        type: 'Microsoft.HybridContainerService/provisionedClusterInstances',
        name: 'default',
        scopeFormat: 'resourceId',  // Uses resourceId() not format()
        extendedLocationAfterProperties: true,
        hasDependsOn: true,
        controlPlaneHasEndpoint: true  // ALWAYS has controlPlaneEndpoint
    }
};

// Load and parse our generator
const generatorPath = path.join(__dirname, 'js', 'generator-v2-hotfix.js');
let code = fs.readFileSync(generatorPath, 'utf8');

// Extract class
const classMatch = code.match(/class TemplateGenerator \{[\s\S]+$/);
if (!classMatch) {
    console.error('❌ Failed to extract TemplateGenerator class');
    process.exit(1);
}

// Eval the class
eval(classMatch[0]);

// Generate test template
const testConfig = {
    clusterName: 'test-cluster',
    kubernetesVersion: '1.27.9',
    controlPlaneCount: 1,
    controlPlaneVmSize: 'Standard_A4_v2',
    customLocation: '/subscriptions/test/resourceGroups/test/providers/Microsoft.ExtendedLocation/customLocations/test',
    logicalNetwork: '/subscriptions/test/resourceGroups/test/providers/Microsoft.AzureStackHCI/logicalNetworks/test',
    sshPublicKey: 'ssh-rsa AAAAB3...',
    controlPlaneIP: '10.0.0.100',
    nodePools: [{
        name: 'nodepool1',
        count: 1,
        vmSize: 'Standard_A4_v2',
        osType: 'Linux'
    }]
};

console.log('Generating ARM template...');
const generator = new TemplateGenerator();
const templateJson = generator.generateARM(testConfig);
const template = JSON.parse(templateJson);

console.log(`Generator version: ${template.metadata._generator.version}\n`);

// Find resources
const connectedCluster = template.resources.find(r => r.type === 'Microsoft.Kubernetes/ConnectedClusters');
const provisionedCluster = template.resources.find(r => r.type === 'Microsoft.HybridContainerService/provisionedClusterInstances');

let allPassed = true;

console.log('=== ConnectedClusters Validation ===');
if (connectedCluster.apiVersion === portalExpectations.connectedCluster.apiVersion) {
    console.log(`✅ API version: ${connectedCluster.apiVersion}`);
} else {
    console.error(`❌ API version: ${connectedCluster.apiVersion} (expected ${portalExpectations.connectedCluster.apiVersion})`);
    allPassed = false;
}

if (connectedCluster.properties.aadProfile.adminGroupObjectIDs) {
    console.log('✅ adminGroupObjectIDs present in aadProfile');
} else {
    console.error('❌ adminGroupObjectIDs MISSING from aadProfile');
    allPassed = false;
}

if (connectedCluster.properties.aadProfile.enableAzureRBAC !== undefined) {
    console.log('✅ enableAzureRBAC present in aadProfile');
} else {
    console.error('❌ enableAzureRBAC MISSING from aadProfile');
    allPassed = false;
}

console.log('');
console.log('=== ProvisionedClusterInstances Validation ===');

if (provisionedCluster.apiVersion === portalExpectations.provisionedCluster.apiVersion) {
    console.log(`✅ API version: ${provisionedCluster.apiVersion}`);
} else {
    console.error(`❌ API version: ${provisionedCluster.apiVersion} (expected ${portalExpectations.provisionedCluster.apiVersion})`);
    allPassed = false;
}

if (provisionedCluster.name === 'default') {
    console.log('✅ Name is "default"');
} else {
    console.error(`❌ Name is "${provisionedCluster.name}" (expected "default")`);
    allPassed = false;
}

// Check scope format
if (provisionedCluster.scope && provisionedCluster.scope.includes('resourceId')) {
    console.log('✅ Scope uses resourceId() format (portal-style)');
} else {
    console.error('❌ Scope does NOT use resourceId() format');
    console.error(`   Found: ${provisionedCluster.scope}`);
    allPassed = false;
}

// Check dependsOn
if (provisionedCluster.dependsOn && provisionedCluster.dependsOn.length > 0) {
    console.log('✅ dependsOn array present');
} else {
    console.error('❌ dependsOn array MISSING');
    allPassed = false;
}

// Check extendedLocation position (should be after properties)
const provClusterKeys = Object.keys(provisionedCluster);
const propertiesIndex = provClusterKeys.indexOf('properties');
const extendedLocationIndex = provClusterKeys.indexOf('extendedLocation');

if (extendedLocationIndex > propertiesIndex) {
    console.log('✅ extendedLocation positioned AFTER properties (portal-style)');
} else {
    console.error('❌ extendedLocation positioned BEFORE properties');
    allPassed = false;
}

// Check controlPlane has endpoint
if (provisionedCluster.properties.controlPlane.controlPlaneEndpoint) {
    console.log('✅ controlPlane.controlPlaneEndpoint present (portal always includes this)');
} else {
    console.error('❌ controlPlane.controlPlaneEndpoint MISSING');
    allPassed = false;
}

console.log('');
console.log('=== Parameter Validation ===');
if (template.parameters.adminGroupObjectIDs) {
    console.log('✅ adminGroupObjectIDs parameter exists');
    if (template.parameters.adminGroupObjectIDs.type === 'array') {
        console.log('  - Correct type: array');
    } else {
        console.error(`  - Wrong type: ${template.parameters.adminGroupObjectIDs.type}`);
        allPassed = false;
    }
} else {
    console.error('❌ adminGroupObjectIDs parameter MISSING');
    allPassed = false;
}

console.log('');
console.log('=== Summary ===');
if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - Template matches portal structure');
    console.log('   Ready for Azure deployment');
} else {
    console.error('❌ VALIDATION FAILED - Template does not match portal structure');
    console.error('   Deployment may fail');
    process.exit(1);
}
