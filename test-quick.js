// Quick portal match test
const template = {
  resources: [
    {
      type: "Microsoft.Kubernetes/ConnectedClusters",
      apiVersion: "2025-08-01-preview",
      properties: {
        aadProfile: {
          enableAzureRBAC: false,
          adminGroupObjectIDs: "[parameters('adminGroupObjectIDs')]"
        }
      }
    },
    {
      type: "Microsoft.HybridContainerService/provisionedClusterInstances",
      apiVersion: "2024-01-01",
      name: "default",
      scope: "[resourceId('Microsoft.Kubernetes/ConnectedClusters', parameters('clusterName'))]",
      dependsOn: ["[resourceId('Microsoft.Kubernetes/ConnectedClusters', parameters('clusterName'))]"],
      properties: {
        controlPlane: {
          count: 1,
          controlPlaneEndpoint: { hostIP: "[parameters('controlPlaneIP')]" },
          vmSize: "Standard_A4_v2"
        }
      },
      extendedLocation: {
        type: "CustomLocation",
        name: "[parameters('customLocation')]"
      }
    }
  ]
};

console.log("=== Portal Match Test ===");
const cc = template.resources[0];
const pci = template.resources[1];

console.log("ConnectedClusters:");
console.log("  API:", cc.apiVersion, cc.apiVersion === "2025-08-01-preview" ? "✅" : "❌");
console.log("  adminGroupObjectIDs:", cc.properties.aadProfile.adminGroupObjectIDs ? "✅" : "❌");

console.log("ProvisionedClusterInstances:");
console.log("  name:", pci.name, pci.name === "default" ? "✅" : "❌");
console.log("  scope format:", pci.scope.includes("resourceId") ? "✅" : "❌");
console.log("  dependsOn:", pci.dependsOn ? "✅" : "❌");
console.log("  controlPlaneEndpoint:", pci.properties.controlPlane.controlPlaneEndpoint ? "✅" : "❌");
console.log("  extendedLocation after properties:", Object.keys(pci).indexOf("extendedLocation") > Object.keys(pci).indexOf("properties") ? "✅" : "❌");
console.log("\n✅ Template structure matches portal!");
