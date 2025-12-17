/**
 * Schema Validation Test for AKS Arc ARM Templates
 * Validates generated templates against official Azure Resource Manager schemas
 */

const fs = require('fs');
const path = require('path');

// Load generator by reading and extracting the class
const generatorPath = path.join(__dirname, 'js', 'generator-v2-hotfix.js');
let generatorCode = fs.readFileSync(generatorPath, 'utf8');
// Remove console.log at start
generatorCode = generatorCode.replace(/console\.log\([^)]+\);?/g, '');
// Extract just the class definition
const classMatch = generatorCode.match(/class TemplateGenerator \{[\s\S]+\}/);
if (!classMatch) {
    console.error('Failed to extract TemplateGenerator class');
    process.exit(1);
}
eval(classMatch[0]);

console.log('=== Azure ARM Template Schema Validation ===\n');

// Official schema for ConnectedClusters@2024-01-01
const VALID_CONNECTED_CLUSTER_PROPERTIES = [
    'aadProfile',
    'agentPublicKeyCertificate',
    'arcAgentProfile',
    'azureHybridBenefit',
    'distribution',
    'distributionVersion',
    'infrastructure',
    'privateLinkScopeResourceId',
    'privateLinkState',
    'provisioningState'
];

// Properties that should NOT be in ConnectedClusters
const INVALID_CONNECTED_CLUSTER_PROPERTIES = [
    'securityProfile',
    'oidcIssuerProfile',
    'workloadIdentity'
];

// Test configuration
const testConfig = {
    clusterName: 'test-cluster',
    kubernetesVersion: '1.27.9',
    controlPlaneCount: 1,
    controlPlaneVmSize: 'Standard_A4_v2',
    customLocation: '/subscriptions/test/resourceGroups/test/providers/Microsoft.ExtendedLocation/customLocations/test',
    logicalNetwork: '/subscriptions/test/resourceGroups/test/providers/Microsoft.AzureStackHCI/logicalNetworks/test',
    sshPublicKey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...',
    controlPlaneIP: '', // Empty to test optional behavior
    nodePools: [{
        name: 'nodepool1',
        count: 2,
        vmSize: 'Standard_D4s_v5',
        osType: 'Linux'
    }]
};

// Generate ARM template
console.log('Generating ARM template...');
const generator = new TemplateGenerator();
const template = generator.generateARM(testConfig);
const templateObj = JSON.parse(template);

console.log(`✅ Generator version: ${templateObj.metadata._generator.version}\n`);

// Find resources
const connectedCluster = templateObj.resources.find(r => r.type === 'Microsoft.Kubernetes/ConnectedClusters');
const provisionedCluster = templateObj.resources.find(r => r.type === 'Microsoft.HybridContainerService/provisionedClusterInstances');

console.log('=== ConnectedClusters Resource Validation ===');
if (!connectedCluster) {
    console.error('❌ FAILED: ConnectedClusters resource not found');
    process.exit(1);
}

console.log(`API Version: ${connectedCluster.apiVersion}`);
console.log(`Kind: ${connectedCluster.kind}`);
console.log('');

// Validate properties
let hasInvalidProperties = false;
const actualProperties = Object.keys(connectedCluster.properties);

console.log('Checking for INVALID properties (these should NOT exist):');
INVALID_CONNECTED_CLUSTER_PROPERTIES.forEach(prop => {
    if (connectedCluster.properties[prop]) {
        console.error(`❌ FAIL: Property '${prop}' is present but NOT allowed in API version 2024-01-01`);
        hasInvalidProperties = true;
    } else {
        console.log(`✅ PASS: Property '${prop}' correctly omitted`);
    }
});
console.log('');

console.log('Required properties present:');
if (connectedCluster.properties.agentPublicKeyCertificate !== undefined) {
    console.log('✅ PASS: agentPublicKeyCertificate present');
} else {
    console.error('❌ FAIL: agentPublicKeyCertificate missing');
    hasInvalidProperties = true;
}

if (connectedCluster.properties.aadProfile) {
    console.log('✅ PASS: aadProfile present');
} else {
    console.error('❌ FAIL: aadProfile missing');
    hasInvalidProperties = true;
}
console.log('');

console.log('=== ProvisionedClusterInstances Resource Validation ===');
if (!provisionedCluster) {
    console.error('❌ FAILED: ProvisionedClusterInstances resource not found');
    process.exit(1);
}

console.log(`API Version: ${provisionedCluster.apiVersion}`);
console.log(`Name: ${provisionedCluster.name}`);
console.log('');

// Validate critical properties
console.log('Checking critical properties:');

if (typeof provisionedCluster.properties.controlPlane === 'object') {
    console.log('✅ PASS: controlPlane is object (not string)');
    if (provisionedCluster.properties.controlPlane.count) {
        console.log('  - count property present');
    }
    if (provisionedCluster.properties.controlPlane.vmSize) {
        console.log('  - vmSize property present');
    }
    // Since controlPlaneIP is empty, controlPlaneEndpoint should NOT be present
    if (provisionedCluster.properties.controlPlane.controlPlaneEndpoint) {
        console.error('❌ FAIL: controlPlaneEndpoint present when controlPlaneIP is empty');
        hasInvalidProperties = true;
    } else {
        console.log('✅ PASS: controlPlaneEndpoint correctly omitted when IP is empty');
    }
} else {
    console.error('❌ FAIL: controlPlane is not an object');
    hasInvalidProperties = true;
}

if (Array.isArray(provisionedCluster.properties.agentPoolProfiles)) {
    console.log('✅ PASS: agentPoolProfiles is array');
    console.log(`  - Contains ${provisionedCluster.properties.agentPoolProfiles.length} node pool(s)`);
} else {
    console.error('❌ FAIL: agentPoolProfiles is not an array');
    hasInvalidProperties = true;
}

if (provisionedCluster.properties.cloudProviderProfile?.infraNetworkProfile?.vnetSubnetIds) {
    console.log('✅ PASS: cloudProviderProfile.infraNetworkProfile.vnetSubnetIds present');
} else {
    console.error('❌ FAIL: cloudProviderProfile.infraNetworkProfile.vnetSubnetIds missing');
    hasInvalidProperties = true;
}

if (provisionedCluster.properties.linuxProfile?.ssh?.publicKeys) {
    console.log('✅ PASS: linuxProfile.ssh.publicKeys present');
} else {
    console.error('❌ FAIL: linuxProfile.ssh.publicKeys missing');
    hasInvalidProperties = true;
}

console.log('');
console.log('=== Test Summary ===');
if (hasInvalidProperties) {
    console.error('❌ VALIDATION FAILED: Template contains schema violations');
    console.error('   This template will be REJECTED by Azure ARM deployment validation');
    process.exit(1);
} else {
    console.log('✅ ALL VALIDATIONS PASSED');
    console.log('   Template matches official Azure Resource Manager schema');
    console.log('   Ready for deployment to Azure');
}
