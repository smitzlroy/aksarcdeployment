/**
 * POC Document Generator for Azure Arc Extensions
 * Generates detailed proof-of-concept documentation based on official Microsoft documentation
 */

const POC_TEMPLATES = {
    'edge-rag-arc': {
        title: 'Edge RAG - Proof of Concept Guide',
        extension: 'Edge Retrieval Augmented Generation (RAG)',
        overview: `Edge RAG is an Azure Arc-enabled Kubernetes extension that enables secure, on-premises generative AI using Retrieval Augmented Generation. This POC validates the ability to search private data with AI while maintaining data sovereignty and regulatory compliance.`,
        
        prerequisites: [
            'Azure Arc-enabled Kubernetes cluster on Azure Local (formerly Azure Stack HCI)',
            'Minimum 64 cores, 256GB RAM for GPU setup OR 64 cores, 256GB RAM for CPU-only',
            'GPU (optional): NVIDIA GPUs with CUDA support for improved performance',
            'Storage: ReadWriteMany (RWX) capable storage class (Azure Local CSV)',
            'Network: Outbound connectivity to Azure (control plane only, data stays on-premises)',
            'Azure subscription with resource provider registration',
            'Microsoft Entra ID for authentication and RBAC'
        ],
        
        successCriteria: [
            {
                phase: 'Phase 1: Infrastructure Validation (Week 1)',
                criteria: [
                    'Arc extension successfully deployed to Kubernetes cluster',
                    'All pods running and healthy (kubectl get pods -n edge-rag)',
                    'Storage volumes provisioned and accessible',
                    'Network connectivity validated (data plane isolated, control plane connected)',
                    'Authentication working with Microsoft Entra ID',
                    'Resource utilization within acceptable thresholds'
                ]
            },
            {
                phase: 'Phase 2: Data Ingestion & RAG Pipeline (Week 2)',
                criteria: [
                    'Successfully ingest sample documents (minimum 100 documents, various formats)',
                    'Document chunking configured (chunk size 1000-2000 chars, overlap 100-500 chars)',
                    'Vector embeddings generated successfully',
                    'Vector database (Qdrant) operational and queryable',
                    'Search functionality working (hybrid search, vector search, full-text search)',
                    'Verify all data remains on-premises (no data egress to cloud)'
                ]
            },
            {
                phase: 'Phase 3: AI Model & Chat Interface (Week 3)',
                criteria: [
                    'Language model deployed (Phi-3 or selected model)',
                    'Chat endpoint accessible and responsive',
                    'Custom system prompts configured and tested',
                    'Response quality meets business requirements (accuracy, relevance)',
                    'Search parameters tuned (top-k, similarity threshold, search type)',
                    'Out-of-box UI functional for prompt engineering'
                ]
            },
            {
                phase: 'Phase 4: Production Readiness (Week 4)',
                criteria: [
                    'Security controls validated (RBAC, secrets management, encryption)',
                    'Compliance requirements verified (data residency, audit logs, access controls)',
                    'Performance benchmarks met (query latency <2s, throughput requirements)',
                    'High availability tested (pod failures, node failures)',
                    'Backup and disaster recovery procedures documented',
                    'Monitoring and alerting configured (Azure Monitor integration)'
                ]
            }
        ],
        
        testScenarios: [
            {
                name: 'Document Ingestion Test',
                objective: 'Validate data ingestion pipeline with various document types',
                steps: [
                    'Prepare test dataset: 20 PDFs, 20 Word docs, 20 text files, 20 images',
                    'Use data ingestion API or UI to upload documents',
                    'Monitor ingestion progress and check for errors',
                    'Verify documents are chunked and indexed',
                    'Query vector database to confirm embeddings created',
                    'Validate all data stored locally (inspect volume mounts)'
                ],
                expectedResult: 'All documents successfully ingested, chunked, and searchable within 30 minutes',
                validation: 'Run sample queries and verify relevant chunks retrieved'
            },
            {
                name: 'RAG Query Accuracy Test',
                objective: 'Verify retrieval quality and answer relevance',
                steps: [
                    'Create 10 test questions with known answers from ingested documents',
                    'Submit queries via chat endpoint',
                    'Record retrieved documents and generated answers',
                    'Compare answers against ground truth',
                    'Calculate accuracy metrics (precision, recall, F1 score)',
                    'Tune search parameters if accuracy <80%'
                ],
                expectedResult: '80%+ accuracy on test questions, relevant context retrieved',
                validation: 'Manual review by subject matter experts, automated metrics calculation'
            },
            {
                name: 'Multi-User Concurrent Access Test',
                objective: 'Validate system performance under load',
                steps: [
                    'Configure 10 concurrent users',
                    'Each user submits 20 queries over 10-minute period',
                    'Monitor query latency (p50, p95, p99)',
                    'Track resource utilization (CPU, memory, GPU if applicable)',
                    'Check for errors or timeouts',
                    'Verify no performance degradation'
                ],
                expectedResult: 'P95 latency <3s, P99 latency <5s, no errors',
                validation: 'Load testing tools, Azure Monitor metrics'
            },
            {
                name: 'Data Sovereignty Verification',
                objective: 'Confirm data never leaves on-premises environment',
                steps: [
                    'Enable network traffic monitoring',
                    'Ingest sensitive test documents',
                    'Perform queries on sensitive data',
                    'Inspect network logs for any data egress',
                    'Verify only metadata sent to Azure (subscription ID, cluster name)',
                    'Check storage volumes to confirm data locality'
                ],
                expectedResult: 'Zero customer data transmitted to cloud, only telemetry metadata',
                validation: 'Network packet capture, firewall logs, storage inspection'
            },
            {
                name: 'Disaster Recovery Test',
                objective: 'Validate backup/restore procedures',
                steps: [
                    'Create backup of vector database and configuration',
                    'Simulate pod failure (delete critical pods)',
                    'Verify Kubernetes self-healing (pods recreated)',
                    'Test data persistence (queries still work after pod restart)',
                    'Simulate node failure and validate workload migration',
                    'Document recovery time objective (RTO) and recovery point objective (RPO)'
                ],
                expectedResult: 'System recovers automatically within 5 minutes, no data loss',
                validation: 'Kubernetes events, pod status, query functionality'
            }
        ],
        
        securityValidation: [
            'Microsoft Entra ID integration functional (test with multiple user roles)',
            'Azure RBAC enforced (verify unauthorized access blocked)',
            'Secrets stored in Kubernetes secrets (not plain text)',
            'Encryption at rest enabled (BitLocker on Azure Local CSV)',
            'Encryption in transit (TLS for API endpoints)',
            'Network policies configured (pod-to-pod traffic restricted)',
            'Audit logs enabled and accessible (track all API calls)',
            'Compliance with regulatory requirements (HIPAA, PCI DSS, etc.)'
        ],
        
        complianceChecklist: [
            { framework: 'HIPAA', controls: 'Data residency, encryption, access controls, audit logging' },
            { framework: 'PCI DSS', controls: 'Network segmentation, encryption, access logging' },
            { framework: 'GDPR', controls: 'Data locality, right to be forgotten, data processing records' },
            { framework: 'ISO 27001', controls: 'Information security management, risk assessment' }
        ],
        
        productionReadinessCriteria: [
            'All Phase 4 success criteria met',
            'Security audit completed with no critical findings',
            'Performance benchmarks consistently met over 7-day period',
            'Disaster recovery tested and documented',
            'Operational runbooks created (deployment, monitoring, troubleshooting)',
            'Training completed for operations team',
            'Support escalation paths established',
            'Change management process defined',
            'Capacity planning completed for production scale'
        ],
        
        references: [
            'Edge RAG Overview: https://learn.microsoft.com/en-us/azure/azure-arc/edge-rag/overview',
            'Edge RAG Requirements: https://learn.microsoft.com/en-us/azure/azure-arc/edge-rag/requirements',
            'Azure Arc Security: https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-security-book'
        ]
    },
    
    'video-indexer-arc': {
        title: 'Azure AI Video Indexer Arc - Proof of Concept Guide',
        extension: 'Azure AI Video Indexer enabled by Arc',
        overview: `Azure AI Video Indexer enabled by Arc brings video and audio analysis AI capabilities to the edge, enabling on-premises processing while maintaining data sovereignty. This POC validates the ability to extract insights from video content without uploading media to the cloud.`,
        
        prerequisites: [
            'Azure Arc-enabled Kubernetes cluster on Azure Local',
            'Minimum: 32 cores, 64GB RAM, 50GB storage (1 node)',
            'Recommended: 48-64 cores, 256GB RAM, 100GB storage (2+ nodes for HA)',
            'Storage: ReadWriteMany (RWX) storage class required',
            'Operating System: Ubuntu 22.04 LTS or compatible Linux',
            'Kubernetes 1.29+',
            'Azure CLI 2.64.0+',
            'Network: Outbound connectivity to Azure (see firewall requirements)',
            'Azure subscription approved for gated service (apply at aka.ms/vi-register)',
            'Azure AI Video Indexer account (Resource Manager account type)'
        ],
        
        successCriteria: [
            {
                phase: 'Phase 1: Extension Deployment (Week 1)',
                criteria: [
                    'Video Indexer extension successfully installed',
                    'All pods running in healthy state',
                    'Storage volumes provisioned and mounted',
                    'Network connectivity validated (firewall rules configured)',
                    'Extension registered with Azure Video Indexer account',
                    'Access tokens obtainable via API/CLI',
                    'Phi language model connected and operational'
                ]
            },
            {
                phase: 'Phase 2: Video Indexing Validation (Week 2)',
                criteria: [
                    'Successfully index test videos (minimum 10 videos, various formats)',
                    'Vision preset working (scene detection, object detection, key frames)',
                    'Audio preset working (transcription, translation, captioning)',
                    'Advanced preset working (vision + audio combined)',
                    'Indexing duration acceptable (<2x real-time for standard video)',
                    'Insights extracted accurately (transcription quality, object accuracy)',
                    'Verify video content never uploaded to cloud'
                ]
            },
            {
                phase: 'Phase 3: AI Features & Integration (Week 3)',
                criteria: [
                    'Textual summarization functional (Phi model)',
                    'Prompt content generation working',
                    'Custom AI models integrated (if using BYO model)',
                    'API integration successful (index, get insights, delete)',
                    'Multi-store deployment tested (different presets per store)',
                    'Translation working (35+ source languages to English)',
                    'Captioning generated successfully'
                ]
            },
            {
                phase: 'Phase 4: Production Readiness (Week 4)',
                criteria: [
                    'High availability validated (2+ node cluster, pod anti-affinity)',
                    'Performance meets requirements (throughput, concurrency)',
                    'Security controls validated (authentication, RBAC, encryption)',
                    'Compliance requirements verified (data governance, audit trails)',
                    'Monitoring and alerting configured',
                    'Backup/restore procedures tested',
                    'Operational runbooks completed'
                ]
            }
        ],
        
        testScenarios: [
            {
                name: 'Video Format Compatibility Test',
                objective: 'Validate support for required video formats and codecs',
                steps: [
                    'Prepare test videos: MP4, AVI, MKV, MOV, WMV formats',
                    'Include various codecs: H.264, H.265/HEVC, MPEG-2, VC-1',
                    'Test audio codecs: AAC, MP3, FLAC, WAV',
                    'Submit videos for indexing via API',
                    'Monitor indexing progress and completion status',
                    'Verify insights extracted from all formats'
                ],
                expectedResult: 'All supported formats successfully indexed (see docs for full list)',
                validation: 'Check indexing status, review extracted insights'
            },
            {
                name: 'Vision AI Accuracy Test',
                objective: 'Validate object detection and scene analysis accuracy',
                steps: [
                    'Select 10 videos with known objects/scenes',
                    'Index videos with vision preset',
                    'Review detected objects, scenes, key frames',
                    'Compare against ground truth annotations',
                    'Calculate precision, recall, F1 score',
                    'Document false positives and false negatives'
                ],
                expectedResult: 'Object detection accuracy >85%, scene detection >90%',
                validation: 'Manual review by domain experts, automated metrics'
            },
            {
                name: 'Transcription Accuracy Test',
                objective: 'Validate speech-to-text quality across languages',
                steps: [
                    'Prepare videos with clear speech in 5+ languages',
                    'Index with audio preset',
                    'Review transcription output',
                    'Compare against reference transcripts',
                    'Calculate Word Error Rate (WER)',
                    'Test translation to English'
                ],
                expectedResult: 'WER <10% for clear audio, translation accuracy >85%',
                validation: 'Manual review, automated WER calculation'
            },
            {
                name: 'Concurrent Indexing Load Test',
                objective: 'Validate system performance under concurrent workloads',
                steps: [
                    'Submit 20 videos simultaneously for indexing',
                    'Monitor system resource utilization (CPU, memory, storage)',
                    'Track indexing duration for each video',
                    'Check for errors or timeouts',
                    'Verify queue management and prioritization',
                    'Test with different video resolutions (720p, 1080p)'
                ],
                expectedResult: 'All videos indexed successfully, no failures, indexing time consistent',
                validation: 'Azure Monitor metrics, API response codes, pod logs'
            },
            {
                name: 'Data Locality Verification',
                objective: 'Confirm video content never leaves edge environment',
                steps: [
                    'Enable network monitoring and packet capture',
                    'Index sensitive test video',
                    'Monitor all network traffic to Azure',
                    'Verify only control plane metadata transmitted',
                    'Confirm video file and insights stored locally',
                    'Check Azure Video Indexer cloud account (should show extension but no video data)'
                ],
                expectedResult: 'Zero video data egress, only billing/monitoring metadata to cloud',
                validation: 'Network logs, firewall analysis, storage inspection'
            },
            {
                name: 'Extension Upgrade Test',
                objective: 'Validate seamless upgrade process',
                steps: [
                    'Document current extension version',
                    'Index test videos before upgrade',
                    'Enable auto-upgrade property (recommended)',
                    'Manually trigger upgrade to latest version',
                    'Monitor upgrade process (pod recreation, downtime)',
                    'Verify existing indexed videos still accessible',
                    'Re-index test videos to validate new version'
                ],
                expectedResult: 'Upgrade completes within 10 minutes, no data loss, functionality preserved',
                validation: 'Extension version check, indexed video verification'
            }
        ],
        
        securityValidation: [
            'Extension access tokens working (API/CLI)',
            'Unauthorized access attempts blocked',
            'Network policies enforced (pod-to-pod isolation)',
            'Storage encryption enabled (Azure Local CSV with BitLocker)',
            'TLS for API endpoints',
            'Azure RBAC integration functional',
            'Audit logging enabled (track all indexing operations)',
            'Secrets management (API keys, certificates stored securely)'
        ],
        
        complianceChecklist: [
            { framework: 'Data Governance', controls: 'Video content stays on-premises, no cloud upload' },
            { framework: 'Regulatory Compliance', controls: 'Suitable for regulated industries (finance, healthcare, government)' },
            { framework: 'Architecture Decisions', controls: 'Supports hybrid cloud strategy, data sovereignty' },
            { framework: 'GDPR', controls: 'Data locality, processing transparency, retention policies' }
        ],
        
        productionReadinessCriteria: [
            'All Phase 4 success criteria achieved',
            'High availability tested and validated',
            'Disaster recovery plan documented and tested',
            'Capacity planning completed (estimate videos/day, storage growth)',
            'Monitoring dashboards configured (indexing queue, errors, performance)',
            'Operations runbooks created (deployment, upgrades, troubleshooting)',
            'Training completed for operations and development teams',
            'Integration with downstream applications tested',
            'Change management and escalation procedures defined'
        ],
        
        references: [
            'Video Indexer Arc Overview: https://learn.microsoft.com/en-us/azure/azure-video-indexer/arc/azure-video-indexer-enabled-by-arc-overview',
            'Video Indexer Arc Quickstart: https://learn.microsoft.com/en-us/azure/azure-video-indexer/azure-video-indexer-enabled-by-arc-quickstart',
            'GitHub Samples: https://github.com/Azure-Samples/azure-video-indexer-samples',
            'Arc Jumpstart: https://arcjumpstart.com/azure_arc_jumpstart/azure_edge_iot_ops/aks_edge_essentials_single_vi'
        ]
    },
    
    'iot-operations-arc': {
        title: 'Azure IoT Operations - Proof of Concept Guide',
        extension: 'Azure IoT Operations',
        overview: `Azure IoT Operations is a unified data plane for the edge that provides modular, scalable data services on Azure Arc-enabled Kubernetes. This POC validates the ability to connect industrial assets, process OT data at the edge, and integrate with cloud analytics while maintaining operational continuity.`,
        
        prerequisites: [
            'Azure Arc-enabled Kubernetes cluster on Azure Local',
            'Minimum: 12 cores, 24GB RAM (basic deployment)',
            'Recommended: 12 cores, 48GB RAM (production-ready)',
            'Production: 40 cores, 160GB RAM (high-scale)',
            'Storage: Persistent volumes for MQTT broker state',
            'Network: Outbound connectivity to Azure, access to OT network',
            'Azure subscription with IoT Operations resource provider',
            'OPC UA servers or industrial assets for testing',
            'Microsoft Entra ID for authentication'
        ],
        
        successCriteria: [
            {
                phase: 'Phase 1: Core Services Deployment (Week 1)',
                criteria: [
                    'Azure IoT Operations deployed successfully',
                    'MQTT broker operational and accepting connections',
                    'Akri discovery service running',
                    'Operations Experience UI accessible',
                    'Azure Device Registry connected',
                    'Authentication working (Entra ID)',
                    'All pods healthy and stable'
                ]
            },
            {
                phase: 'Phase 2: Asset Connectivity (Week 2)',
                criteria: [
                    'OPC UA assets discovered automatically via Akri',
                    'Manual asset registration working (Operations Experience UI)',
                    'Assets publishing data to MQTT broker',
                    'MQTT topics properly structured and subscribed',
                    'Asset metadata stored in Azure Device Registry',
                    'Real-time data visible in Operations Experience UI',
                    'Connection resilience tested (disconnect/reconnect)'
                ]
            },
            {
                phase: 'Phase 3: Data Processing & Cloud Integration (Week 3)',
                criteria: [
                    'Data flows configured and operational',
                    'Data transformation working (normalization, enrichment)',
                    'Schema registry functional (serialization/deserialization)',
                    'Cloud endpoints configured (Event Hubs, Fabric, ADLS, etc.)',
                    'Data successfully flowing to at least one cloud destination',
                    'Edge processing validated (filtering, aggregation at edge)',
                    'Offline capability tested (72-hour disconnection scenario)'
                ]
            },
            {
                phase: 'Phase 4: Production Readiness (Week 4)',
                criteria: [
                    'Security controls validated (TLS, authentication, authorization)',
                    'Compliance requirements verified (IEC 62443, NERC CIP if applicable)',
                    'Performance benchmarks met (message throughput, latency)',
                    'High availability tested (MQTT broker clustering)',
                    'Monitoring and alerting configured',
                    'Disaster recovery tested',
                    'Operational procedures documented'
                ]
            }
        ],
        
        testScenarios: [
            {
                name: 'OPC UA Asset Discovery Test',
                objective: 'Validate automatic discovery of OPC UA servers',
                steps: [
                    'Deploy test OPC UA server on network',
                    'Configure Akri OPC UA connector with discovery settings',
                    'Monitor Akri logs for discovery events',
                    'Verify asset appears in Operations Experience UI',
                    'Check Azure Device Registry for asset metadata',
                    'Subscribe to asset MQTT topics and verify data'
                ],
                expectedResult: 'OPC UA server automatically discovered within 5 minutes, data flowing',
                validation: 'Operations Experience UI, MQTT broker topics, Device Registry'
            },
            {
                name: 'MQTT Broker Performance Test',
                objective: 'Validate MQTT broker throughput and latency',
                steps: [
                    'Configure 10 simulated MQTT publishers',
                    'Each publisher sends 100 messages/second',
                    'Configure 5 subscribers on different topics',
                    'Monitor message delivery latency (end-to-end)',
                    'Track broker CPU and memory utilization',
                    'Test with MQTT 3.1.1 and MQTT 5.0 protocols'
                ],
                expectedResult: 'Broker handles 1000 msg/sec with <100ms p95 latency, <80% resource utilization',
                validation: 'MQTT test tools, Azure Monitor metrics'
            },
            {
                name: 'Data Flow Transformation Test',
                objective: 'Validate data processing and transformation capabilities',
                steps: [
                    'Create data flow with source (MQTT topic) and destination (Event Hubs)',
                    'Configure transformations: normalize timestamps, filter outliers, aggregate data',
                    'Use schema registry to deserialize OPC UA data',
                    'Publish test messages with various formats',
                    'Verify transformed data in Event Hubs',
                    'Check for data loss or corruption'
                ],
                expectedResult: 'All transformations applied correctly, 100% data fidelity, no message loss',
                validation: 'Event Hubs message inspection, data flow logs'
            },
            {
                name: 'Offline Resilience Test',
                objective: 'Validate edge autonomy during cloud disconnection',
                steps: [
                    'Establish baseline operation with cloud connectivity',
                    'Disconnect edge cluster from Azure (simulate network failure)',
                    'Continue publishing asset data to MQTT broker',
                    'Verify data flows continue processing at edge',
                    'Monitor for degradation (queue buildup, memory pressure)',
                    'Reconnect after 24-48 hours',
                    'Verify data backfill to cloud'
                ],
                expectedResult: 'System operates for 72 hours offline, data queued and sent when reconnected',
                validation: 'MQTT broker persistence, cloud endpoint data arrival'
            },
            {
                name: 'Multi-Protocol Integration Test',
                objective: 'Validate connectivity with various industrial protocols',
                steps: [
                    'Connect OPC UA asset',
                    'Connect Modbus device (via Akri or gateway)',
                    'Connect HTTP/REST endpoint',
                    'Configure MQTT-based sensors',
                    'Verify all protocols publishing to unified MQTT broker',
                    'Create data flows to normalize data from all sources'
                ],
                expectedResult: 'All protocols integrated, unified data model, single MQTT namespace',
                validation: 'Operations Experience UI, MQTT topic structure'
            },
            {
                name: 'Cloud Destinations Integration Test',
                objective: 'Validate data routing to multiple cloud endpoints',
                steps: [
                    'Configure Event Hubs endpoint',
                    'Configure Fabric OneLake endpoint',
                    'Configure Azure Data Lake Storage endpoint',
                    'Create data flows routing to each destination',
                    'Publish test data with different characteristics',
                    'Verify data arrives at all destinations',
                    'Check for duplicates or missing data'
                ],
                expectedResult: 'Data successfully delivered to all configured cloud endpoints',
                validation: 'Inspect Event Hubs, query Fabric, check ADLS containers'
            }
        ],
        
        securityValidation: [
            'MQTT broker TLS encryption enabled',
            'Client authentication configured (X.509 certificates or SAS tokens)',
            'Authorization policies enforced (topic-level access control)',
            'Microsoft Entra ID integration for operations UI',
            'Secrets stored securely (Azure Key Vault or Kubernetes secrets)',
            'Network segmentation (OT network isolated from IT)',
            'Audit logging enabled (track configuration changes, access)',
            'Compliance with IEC 62443 (industrial security standard)'
        ],
        
        complianceChecklist: [
            { framework: 'IEC 62443', controls: 'Industrial security zones, network segmentation, access control' },
            { framework: 'NERC CIP', controls: 'Critical infrastructure protection (energy sector)' },
            { framework: 'NIST CSF', controls: 'Identify, protect, detect, respond, recover framework' },
            { framework: 'GDPR', controls: 'Data processing transparency, data locality options' },
            { framework: 'ISO 27001', controls: 'Information security management system' }
        ],
        
        productionReadinessCriteria: [
            'All Phase 4 success criteria met',
            'Security audit passed (no critical or high findings)',
            'Performance validated under production load',
            'Disaster recovery tested and documented',
            'Capacity planning completed (asset scale, data volume projections)',
            'Operations runbooks created (deployment, monitoring, troubleshooting)',
            'Integration with SCADA/MES systems validated',
            'Training completed for OT and IT teams',
            'Change management processes established',
            'Support escalation paths defined with Microsoft'
        ],
        
        references: [
            'Azure IoT Operations Overview: https://learn.microsoft.com/en-us/azure/iot-operations/overview-iot-operations',
            'Get Started Guide: https://learn.microsoft.com/en-us/azure/iot-operations/get-started-end-to-end-sample/quickstart-deploy',
            'MQTT Broker Documentation: https://learn.microsoft.com/en-us/azure/iot-operations/manage-mqtt-broker/overview-broker',
            'Data Flows: https://learn.microsoft.com/en-us/azure/iot-operations/connect-to-cloud/overview-dataflow'
        ]
    }
};

function generatePOCDocument(extensionKey) {
    const template = POC_TEMPLATES[extensionKey];
    if (!template) {
        console.error('No POC template found for:', extensionKey);
        return null;
    }
    
    // Generate markdown document
    let markdown = `# ${template.title}\n\n`;
    markdown += `## Executive Summary\n\n`;
    markdown += `${template.overview}\n\n`;
    markdown += `**Extension:** ${template.extension}\n\n`;
    markdown += `**POC Duration:** 4 weeks\n\n`;
    markdown += `**Document Version:** 1.0\n`;
    markdown += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;
    
    // Prerequisites
    markdown += `## Prerequisites\n\n`;
    template.prerequisites.forEach(req => {
        markdown += `- ${req}\n`;
    });
    markdown += `\n`;
    
    // Success Criteria by Phase
    markdown += `## Success Criteria\n\n`;
    template.successCriteria.forEach(phase => {
        markdown += `### ${phase.phase}\n\n`;
        phase.criteria.forEach(criterion => {
            markdown += `- ✅ ${criterion}\n`;
        });
        markdown += `\n`;
    });
    
    // Test Scenarios
    markdown += `## Test Scenarios\n\n`;
    template.testScenarios.forEach((scenario, index) => {
        markdown += `### Scenario ${index + 1}: ${scenario.name}\n\n`;
        markdown += `**Objective:** ${scenario.objective}\n\n`;
        markdown += `**Steps:**\n`;
        scenario.steps.forEach((step, stepIndex) => {
            markdown += `${stepIndex + 1}. ${step}\n`;
        });
        markdown += `\n**Expected Result:** ${scenario.expectedResult}\n\n`;
        markdown += `**Validation:** ${scenario.validation}\n\n`;
    });
    
    // Security Validation
    markdown += `## Security Validation Checklist\n\n`;
    template.securityValidation.forEach(item => {
        markdown += `- [ ] ${item}\n`;
    });
    markdown += `\n`;
    
    // Compliance
    markdown += `## Compliance & Regulatory Alignment\n\n`;
    template.complianceChecklist.forEach(item => {
        markdown += `**${item.framework}**\n`;
        markdown += `- ${item.controls}\n\n`;
    });
    
    // Production Readiness
    markdown += `## Production Readiness Criteria\n\n`;
    template.productionReadinessCriteria.forEach(criterion => {
        markdown += `- [ ] ${criterion}\n`;
    });
    markdown += `\n`;
    
    // References
    markdown += `## References & Documentation\n\n`;
    template.references.forEach(ref => {
        markdown += `- ${ref}\n`;
    });
    markdown += `\n`;
    
    // Footer
    markdown += `---\n\n`;
    markdown += `*This POC document is based on official Microsoft documentation and best practices.*\n`;
    markdown += `*All technical specifications and requirements are sourced from Microsoft Learn.*\n`;
    markdown += `*Generated by AKS Arc Deployment Tool - https://smitzlroy.github.io/aksarcdeployment/*\n`;
    
    return markdown;
}

/**
 * POC PDF Report Generator Class
 * Similar to ComplianceReportGenerator but for POC documents
 */
class POCReportGenerator {
    constructor() {
        this.margin = 20;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.contentWidth = this.pageWidth - (2 * this.margin);
    }

    async generatePDFReport(extensionKey, extensionName) {
        const template = POC_TEMPLATES[extensionKey];
        if (!template) {
            throw new Error(`No POC template found for: ${extensionKey}`);
        }

        // Wait for jsPDF to be available
        let attempts = 0;
        while (typeof window.jspdf === 'undefined' && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        let yPos = this.margin;

        // Title Page
        doc.setFontSize(24);
        doc.setTextColor(102, 126, 234);
        yPos = 40;
        doc.text(template.title, this.pageWidth / 2, yPos, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        yPos += 15;
        doc.text(template.extension, this.pageWidth / 2, yPos, { align: 'center' });

        yPos += 20;
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, yPos, { align: 'center' });

        // Add new page for content
        doc.addPage();
        yPos = this.margin;

        // Executive Summary
        yPos = this.addSection(doc, 'Executive Summary', template.overview, yPos);

        // Prerequisites
        yPos = this.addSection(doc, 'Prerequisites', null, yPos);
        template.prerequisites.forEach(req => {
            yPos = this.addBulletPoint(doc, req, yPos);
        });

        // Success Criteria
        doc.addPage();
        yPos = this.margin;
        yPos = this.addHeading(doc, 'Success Criteria', yPos);
        
        template.successCriteria.forEach(phase => {
            yPos = this.addSubheading(doc, phase.phase, yPos);
            phase.criteria.forEach(criterion => {
                yPos = this.addBulletPoint(doc, criterion, yPos, '✓');
            });
        });

        // Test Scenarios
        template.testScenarios.forEach((scenario, index) => {
            if (yPos > 240) {
                doc.addPage();
                yPos = this.margin;
            }
            yPos = this.addSubheading(doc, `Scenario ${index + 1}: ${scenario.name}`, yPos);
            yPos = this.addText(doc, `Objective: ${scenario.objective}`, yPos);
            yPos += 3;
            yPos = this.addText(doc, 'Steps:', yPos);
            scenario.steps.forEach((step, stepIndex) => {
                yPos = this.addBulletPoint(doc, `${stepIndex + 1}. ${step}`, yPos);
            });
            yPos = this.addText(doc, `Expected Result: ${scenario.expectedResult}`, yPos);
            yPos = this.addText(doc, `Validation: ${scenario.validation}`, yPos);
            yPos += 5;
        });

        // Security Validation
        doc.addPage();
        yPos = this.margin;
        yPos = this.addHeading(doc, 'Security Validation Checklist', yPos);
        template.securityValidation.forEach(item => {
            yPos = this.addBulletPoint(doc, item, yPos, '☐');
        });

        // Compliance
        yPos += 5;
        yPos = this.addHeading(doc, 'Compliance & Regulatory Alignment', yPos);
        template.complianceChecklist.forEach(item => {
            yPos = this.addText(doc, `${item.framework}: ${item.controls}`, yPos);
            yPos += 3;
        });

        // Production Readiness
        doc.addPage();
        yPos = this.margin;
        yPos = this.addHeading(doc, 'Production Readiness Criteria', yPos);
        template.productionReadinessCriteria.forEach(criterion => {
            yPos = this.addBulletPoint(doc, criterion, yPos, '☐');
        });

        // References
        yPos += 10;
        yPos = this.addHeading(doc, 'References & Documentation', yPos);
        template.references.forEach(ref => {
            yPos = this.addText(doc, ref, yPos, 8);
            yPos += 2;
        });

        // Save
        const filename = `${extensionName.replace(/[^a-zA-Z0-9]/g, '_')}_POC_Guide_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        return filename;
    }

    addHeading(doc, text, yPos) {
        if (yPos > 260) {
            doc.addPage();
            yPos = this.margin;
        }
        doc.setFontSize(14);
        doc.setTextColor(102, 126, 234);
        doc.text(text, this.margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        return yPos;
    }

    addSubheading(doc, text, yPos) {
        if (yPos > 270) {
            doc.addPage();
            yPos = this.margin;
        }
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text(text, this.margin, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        return yPos;
    }

    addSection(doc, title, text, yPos) {
        yPos = this.addHeading(doc, title, yPos);
        if (text) {
            yPos = this.addText(doc, text, yPos);
        }
        return yPos;
    }

    addText(doc, text, yPos, fontSize = 10) {
        if (yPos > 270) {
            doc.addPage();
            yPos = this.margin;
        }
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, this.contentWidth);
        doc.text(lines, this.margin, yPos);
        yPos += lines.length * 5;
        return yPos;
    }

    addBulletPoint(doc, text, yPos, bullet = '•') {
        if (yPos > 275) {
            doc.addPage();
            yPos = this.margin;
        }
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(text, this.contentWidth - 10);
        doc.text(bullet, this.margin + 2, yPos);
        doc.text(lines, this.margin + 8, yPos);
        yPos += Math.max(lines.length * 4.5, 5);
        return yPos;
    }
}

// Export functions for use in app.js
window.generatePOCDocument = generatePOCDocument;
window.POC_TEMPLATES = POC_TEMPLATES;
window.POCReportGenerator = POCReportGenerator;
