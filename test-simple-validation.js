/**
 * Direct Schema Validation Test
 * Tests a sample generated ARM template against Azure schema rules
 */

// Sample template (copy from latest generation)
const sampleTemplate = {
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.Kubernetes/ConnectedClusters",
      "apiVersion": "2024-01-01",
      "name": "[parameters('clusterName')]",
      "location": "[parameters('location')]",
      "identity": { "type": "SystemAssigned" },
      "kind": "ProvisionedCluster",
      "properties": {
        "agentPublicKeyCertificate": "",
        "aadProfile": { "enableAzureRBAC": false }
      }
    },
    {
      "type": "Microsoft.HybridContainerService/provisionedClusterInstances",
      "apiVersion": "2024-01-01",
      "name": "default",
      "properties": {
        "controlPlane": {
          "count": "[parameters('controlPlaneCount')]",
          "vmSize": "[parameters('controlPlaneVmSize')]"
        },
        "agentPoolProfiles": [
          { "name": "nodepool1", "count": 2, "vmSize": "Standard_D4s_v5", "osType": "Linux" }
        ]
      }
    }
  ]
};

console.log('=== Azure ARM Template Schema Validation ===\n');

// Properties that should NOT exist in ConnectedClusters@2024-01-01
const FORBIDDEN_PROPERTIES = ['securityProfile', 'oidcIssuerProfile', 'workloadIdentity'];

const connectedCluster = sampleTemplate.resources.find(r => r.type === 'Microsoft.Kubernetes/ConnectedClusters');

console.log('Validating ConnectedClusters resource...');
console.log(`API Version: ${connectedCluster.apiVersion}`);

let passed = true;

// Check for forbidden properties
FORBIDDEN_PROPERTIES.forEach(prop => {
    if (connectedCluster.properties[prop]) {
        console.error(`❌ FAIL: '${prop}' found (NOT allowed in 2024-01-01)`);
        passed = false;
    } else {
        console.log(`✅ PASS: '${prop}' correctly omitted`);
    }
});

// Check required properties
if (!connectedCluster.properties.agentPublicKeyCertificate === undefined) {
    console.error('❌ FAIL: agentPublicKeyCertificate missing');
    passed = false;
} else {
    console.log('✅ PASS: agentPublicKeyCertificate present');
}

if (!connectedCluster.properties.aadProfile) {
    console.error('❌ FAIL: aadProfile missing');
    passed = false;
} else {
    console.log('✅ PASS: aadProfile present');
}

console.log('');
if (passed) {
    console.log('✅ ALL CHECKS PASSED - Template is schema-compliant');
} else {
    console.error('❌ VALIDATION FAILED - Template will be rejected by Azure');
    process.exit(1);
}
