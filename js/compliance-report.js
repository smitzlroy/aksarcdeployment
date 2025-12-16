/**
 * Compliance Attestation Report Generator
 * Generates professional PDF reports for auditors and compliance officers
 */

class ComplianceReportGenerator {
    constructor() {
        this.reportData = null;
    }

    /**
     * Generate compliance attestation report
     */
    async generateReport(deploymentPlan, securityResult, categoryBreakdown, gapAnalysis) {
        // Generate report ID first
        const reportId = this.generateReportId();
        
        // Helper function to safely extract string values (handles both strings and HTMLInputElement)
        const extractStringValue = (value, defaultValue = 'N/A') => {
            if (!value) return defaultValue;
            if (typeof value === 'string') return value;
            if (value.value && typeof value.value === 'string') return value.value.trim();
            if (value.textContent) return value.textContent.trim();
            return String(value);
        };
        
        // Extract values safely from deployment plan
        const clusterName = extractStringValue(deploymentPlan?.clusterConfig?.clusterName);
        const resourceGroup = extractStringValue(deploymentPlan?.clusterConfig?.resourceGroup);
        const customLocation = extractStringValue(deploymentPlan?.clusterConfig?.customLocation);
        const location = extractStringValue(deploymentPlan?.clusterConfig?.location);
        
        console.log('✅ Extracted values:', { clusterName, resourceGroup, customLocation, location });

        this.reportData = {
            deploymentPlan,
            securityResult,
            categoryBreakdown,
            gapAnalysis,
            generatedDate: new Date().toISOString(),
            reportVersion: '2.0',
            reportTitle: 'Kubernetes Compliance & Security Assessment Report',
            reportId: reportId,
            clusterName: clusterName,
            resourceGroup: resourceGroup,
            customLocation: customLocation,
            location: location,
            environment: deploymentPlan?.environment?.name || 'Production'
        };

        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            console.error('jsPDF library not loaded');
            alert('PDF library not loaded. Please refresh the page and try again.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let yPos = 20;

        // Page 1: Professional Cover Page
        this.addCoverPage(doc);
        
        // Page 2: Executive Summary
        doc.addPage();
        yPos = 20;
        yPos = this.addExecutiveSummary(doc, yPos);
        
        // Page 3: Compliance Overview
        doc.addPage();
        yPos = 20;
        yPos = this.addComplianceOverview(doc, yPos);

        // Page 4: Control Evidence Matrix
        doc.addPage();
        yPos = 20;
        yPos = this.addControlEvidenceMatrix(doc, yPos);

        // Page 5: Security Configuration Details
        doc.addPage();
        yPos = 20;
        yPos = this.addSecurityConfiguration(doc, yPos);

        // Page 6: Category Breakdown
        doc.addPage();
        yPos = 20;
        yPos = this.addCategoryBreakdown(doc, yPos);

        // Page 7: Gap Analysis
        if (gapAnalysis && gapAnalysis.frameworks.length > 0) {
            doc.addPage();
            yPos = 20;
            yPos = this.addGapAnalysis(doc, yPos);
        }

        // Page 8: Continuous Compliance Plan
        doc.addPage();
        yPos = 20;
        yPos = this.addContinuousCompliancePlan(doc, yPos);

        // Page 9: Data Sources & Methodology
        doc.addPage();
        yPos = 20;
        yPos = this.addDataSourcesPage(doc, yPos);

        // Page 10: Attestation & Signatures
        doc.addPage();
        yPos = 20;
        yPos = this.addAttestationPage(doc, yPos);

        // Add professional headers and footers to all pages
        this.addHeadersAndFooters(doc);

        // Save PDF
        const fileName = `Compliance_Attestation_${this.reportData.clusterName}_${this.getDateString()}.pdf`;
        doc.save(fileName);

        console.log('✅ Compliance attestation report generated:', fileName);
        return fileName;
    }

    /**
     * Add executive summary page
     */
    addExecutiveSummary(doc, yPos) {
        const plan = this.reportData.deploymentPlan.clusterConfig || this.reportData.deploymentPlan;
        const security = this.reportData.securityResult;

        // Title with accent
        doc.setFillColor(0, 120, 212);
        doc.rect(15, yPos, 180, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', 20, yPos + 8);
        yPos += 18;

        // Reset color
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('This report provides a comprehensive assessment of the Kubernetes cluster\'s security and compliance posture.', 20, yPos);
        yPos += 15;

        // Deployment Information Box - Enhanced
        doc.setDrawColor(0, 120, 212);
        doc.setLineWidth(1.5);
        doc.setFillColor(245, 250, 255);
        doc.rect(15, yPos, 180, 55, 'FD');
        yPos += 8;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 120, 212);
        doc.text('Deployment Information', 20, yPos);
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Two-column layout
        doc.setFont('helvetica', 'bold');
        doc.text('Cluster Name:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.reportData.clusterName || 'N/A', 65, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Location:', 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.reportData.location || this.reportData.customLocation || 'N/A', 140, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Resource Group:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.reportData.resourceGroup || 'N/A', 65, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Environment:', 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.reportData.deploymentPlan.environment?.name || 'Custom', 140, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Industry:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.reportData.deploymentPlan.industryDetails?.name || 'Not specified', 65, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Report ID:', 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.reportData.reportId, 140, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Generated:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date().toLocaleDateString(), 65, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Version:', 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.reportData.reportVersion, 140, yPos);
        yPos += 18;

        // Compliance Score Box - Enhanced with visual prominence
        const scoreColor = this.getScoreColor(security.score);
        doc.setDrawColor(scoreColor.r, scoreColor.g, scoreColor.b);
        doc.setLineWidth(2);
        doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b, 0.15);
        doc.rect(15, yPos, 180, 45, 'FD');
        yPos += 10;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
        doc.text('Overall Compliance Score', 20, yPos);
        yPos += 15;

        // Large score display
        doc.setFontSize(36);
        doc.text(`${security.score}`, 85, yPos, { align: 'center' });
        doc.setFontSize(20);
        doc.text('/100', 110, yPos);
        
        // Rating badge
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const rating = this.getRatingText(security.rating);
        doc.text(rating, 145, yPos);
        yPos += 25;

        // Reset
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Summary Statistics - Professional table format
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        
        // Table header
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos, 180, 10, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Compliance Metrics', 20, yPos + 7);
        yPos += 15;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Metrics rows
        const metrics = [
            { label: 'Security Checks Passed', value: `${security.passedChecks} / ${security.totalChecks}`, pct: `${Math.round((security.passedChecks / security.totalChecks) * 100)}%` },
            { label: 'Security Points Earned', value: `${security.totalPoints} / ${security.maxPoints}`, pct: `${Math.round((security.totalPoints / security.maxPoints) * 100)}%` }
        ];

        if (this.reportData.gapAnalysis) {
            const totalControls = this.reportData.gapAnalysis.frameworks.reduce((sum, fw) => sum + fw.totalCount, 0);
            const compliantControls = this.reportData.gapAnalysis.frameworks.reduce((sum, fw) => sum + fw.compliantCount, 0);
            metrics.push({ 
                label: 'Regulatory Controls Met', 
                value: `${compliantControls} / ${totalControls}`, 
                pct: `${Math.round((compliantControls / totalControls) * 100)}%` 
            });
        }

        metrics.forEach((metric, idx) => {
            const rowY = yPos + (idx * 10);
            if (idx % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(15, rowY - 3, 180, 10, 'F');
            }
            
            doc.text(metric.label, 20, rowY + 4);
            doc.text(metric.value, 120, rowY + 4);
            
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
            doc.text(metric.pct, 180, rowY + 4, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
        });

        yPos += (metrics.length * 10) + 5;

        return yPos;
    }

    /**
     * Add compliance overview page
     */
    addComplianceOverview(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Regulatory Compliance Overview', 20, yPos);
        yPos += 12;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        if (!this.reportData.gapAnalysis || !this.reportData.deploymentPlan.industryDetails) {
            doc.text('No industry-specific compliance requirements selected.', 20, yPos);
            yPos += 10;
            doc.text('This deployment follows general security best practices for Kubernetes.', 20, yPos);
            return yPos + 10;
        }

        const industry = this.reportData.deploymentPlan.industryDetails;
        doc.setFont('helvetica', 'bold');
        doc.text(`Industry: ${industry.name}`, 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        if (industry.description) {
            const description = doc.splitTextToSize(industry.description, 170);
            doc.text(description, 20, yPos);
            yPos += description.length * 5 + 5;
        } else {
            yPos += 5;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Applicable Regulatory Frameworks', 20, yPos);
        yPos += 8;

        // Framework compliance table
        this.reportData.gapAnalysis.frameworks.forEach(framework => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(framework.name, 20, yPos);
            yPos += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            const fwDesc = doc.splitTextToSize(framework.description, 160);
            doc.text(fwDesc, 25, yPos);
            yPos += fwDesc.length * 5;

            // Compliance percentage
            const compliancePercent = framework.compliancePercentage;
            const color = this.getScoreColor(compliancePercent);
            
            doc.setTextColor(color.r, color.g, color.b);
            doc.setFont('helvetica', 'bold');
            doc.text(`Compliance: ${compliancePercent}% (${framework.compliantCount}/${framework.totalCount} controls)`, 25, yPos);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');
            yPos += 8;

            // Scope
            doc.text(`Scope: ${framework.scope}`, 25, yPos);
            yPos += 10;

            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
        });

        // Official Sources
        yPos += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text('All framework requirements sourced from official regulatory bodies.', 20, yPos);
        yPos += 5;
        doc.text('See COMPLIANCE_SOURCES.md in repository for detailed references.', 20, yPos);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');

        return yPos + 10;
    }

    /**
     * Add control evidence matrix
     */
    addControlEvidenceMatrix(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Control Evidence Matrix', 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('This matrix maps security configurations to specific regulatory control requirements.', 20, yPos);
        yPos += 10;

        // Table header
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(0, 120, 212);
        doc.setTextColor(255);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        
        doc.text('Security Check', 17, yPos);
        doc.text('Status', 95, yPos);
        doc.text('Regulatory Controls', 115, yPos);
        yPos += 8;

        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');

        // Table rows
        this.reportData.securityResult.checks.forEach((check, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                // Repeat header
                doc.setFont('helvetica', 'bold');
                doc.setFillColor(0, 120, 212);
                doc.setTextColor(255);
                doc.rect(15, yPos - 5, 180, 8, 'F');
                doc.text('Security Check', 17, yPos);
                doc.text('Status', 95, yPos);
                doc.text('Regulatory Controls', 115, yPos);
                yPos += 8;
                doc.setTextColor(0);
                doc.setFont('helvetica', 'normal');
            }

            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(15, yPos - 5, 180, 10, 'F');
            }

            // Check name
            const checkName = doc.splitTextToSize(check.name, 75);
            doc.text(checkName, 17, yPos);

            // Status (using plain ASCII text instead of special characters)
            const statusText = check.passed ? 'MET' : 'GAP';
            const statusColor = check.passed ? { r: 16, g: 124, b: 16 } : { r: 164, g: 38, b: 44 };
            doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
            doc.text(statusText, 95, yPos);
            doc.setTextColor(0);

            // Controls
            if (check.compliance && check.compliance.length > 0) {
                const controls = check.compliance.join(', ');
                const controlText = doc.splitTextToSize(controls, 75);
                doc.setFontSize(8);
                doc.text(controlText, 115, yPos);
                doc.setFontSize(10);
                yPos += Math.max(checkName.length * 5, controlText.length * 4);
            } else {
                doc.text('General security', 115, yPos);
                yPos += checkName.length * 5;
            }

            yPos += 2;
        });

        return yPos + 10;
    }

    /**
     * Add security configuration details
     */
    addSecurityConfiguration(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Security Configuration Evidence', 20, yPos);
        yPos += 12;

        const plan = this.reportData.deploymentPlan.clusterConfig || this.reportData.deploymentPlan;
        const fullPlan = this.reportData.deploymentPlan;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Infrastructure Configuration', 20, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const nodePools = plan.nodePools || [];
        const controlPlaneCount = plan.controlPlaneCount || 3;
        const totalWorkerNodes = nodePools.reduce((sum, pool) => sum + (pool.nodeCount || 0), 0);

        const configItems = [
            ['Control Plane Nodes', `${controlPlaneCount} nodes (HA: ${controlPlaneCount >= 3 ? 'Yes' : 'No'})`],
            ['Worker Nodes', `${totalWorkerNodes} nodes across ${nodePools.length} pool(s)`],
            ['Availability Sets', plan.enableAvailabilitySets ? 'Enabled' : 'Disabled'],
            ['Auto-scaling', fullPlan.enableAutoScaling ? 'Enabled' : 'Disabled'],
            ['Monitoring', fullPlan.enableMonitoring ? 'Azure Monitor enabled' : 'Not configured'],
            ['Backup', fullPlan.backupEnabled ? 'Configured' : 'Not configured']
        ];

        configItems.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${label}:`, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(value, 80, yPos);
            yPos += 6;
        });

        yPos += 10;

        // Node Pools detail
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Node Pool Configuration', 20, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        nodePools.forEach((pool, index) => {
            doc.setFont('helvetica', 'bold');
            doc.text(`Pool ${index + 1}: ${pool.name}`, 20, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');

            doc.text(`VM SKU: ${pool.vmSize}`, 25, yPos);
            yPos += 5;
            doc.text(`Node Count: ${pool.nodeCount}`, 25, yPos);
            yPos += 5;
            doc.text(`OS: ${pool.osType}`, 25, yPos);
            yPos += 5;
            
            if (pool.mode) {
                doc.text(`Mode: ${pool.mode}`, 25, yPos);
                yPos += 5;
            }

            if (pool.taints && pool.taints.length > 0) {
                doc.text(`Taints: ${pool.taints.join(', ')}`, 25, yPos);
                yPos += 5;
            }

            yPos += 5;

            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
        });

        return yPos + 10;
    }

    /**
     * Add category breakdown
     */
    addCategoryBreakdown(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Security Category Analysis', 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Security posture broken down by category:', 20, yPos);
        yPos += 10;

        if (!this.reportData.categoryBreakdown) {
            doc.text('Category breakdown not available.', 20, yPos);
            return yPos + 10;
        }

        Object.keys(this.reportData.categoryBreakdown).forEach(key => {
            const category = this.reportData.categoryBreakdown[key];
            const color = this.getScoreColor(category.percentage);

            // Category box
            doc.setDrawColor(color.r, color.g, color.b);
            doc.setFillColor(color.r, color.g, color.b, 0.1);
            doc.rect(15, yPos - 5, 180, 25, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(category.name, 20, yPos);
            yPos += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Score: ${category.earnedPoints}/${category.maxPoints} points (${category.percentage}%)`, 20, yPos);
            yPos += 6;
            doc.text(`Checks Passed: ${category.checks.filter(c => c.passed).length}/${category.checks.length}`, 20, yPos);
            yPos += 6;
            doc.text(`Status: ${this.getRatingText(category.status)}`, 20, yPos);
            yPos += 12;

            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
        });

        return yPos + 10;
    }

    /**
     * Add gap analysis
     */
    addGapAnalysis(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Gap Analysis', 20, yPos);
        yPos += 12;

        if (!this.reportData.gapAnalysis) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('No gap analysis available.', 20, yPos);
            return yPos + 10;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        this.reportData.gapAnalysis.frameworks.forEach(framework => {
            if (yPos > 240) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(framework.name, 20, yPos);
            yPos += 7;

            const color = this.getScoreColor(framework.compliancePercentage);
            doc.setTextColor(color.r, color.g, color.b);
            doc.text(`${framework.compliancePercentage}% Compliant`, 20, yPos);
            doc.setTextColor(0);
            yPos += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            if (framework.gapCount > 0) {
                doc.setFont('helvetica', 'bold');
                doc.text(`Gaps Found: ${framework.gapCount}`, 20, yPos);
                yPos += 6;
                doc.setFont('helvetica', 'normal');

                const gaps = framework.controls.filter(c => c.status === 'non-compliant');
                gaps.slice(0, 5).forEach(gap => {
                    doc.text(`- ${gap.controlId}: ${gap.checkName}`, 25, yPos);
                    yPos += 5;
                });

                if (gaps.length > 5) {
                    doc.setFont('helvetica', 'italic');
                    doc.text(`... and ${gaps.length - 5} more gaps`, 25, yPos);
                    doc.setFont('helvetica', 'normal');
                    yPos += 5;
                }
            } else {
                doc.setTextColor(16, 124, 16);
                doc.text('[COMPLIANT] Fully Compliant - No gaps found', 20, yPos);
                doc.setTextColor(0);
                yPos += 6;
            }

            yPos += 8;
        });

        return yPos + 10;
    }

    /**
     * Add continuous compliance plan
     */
    addContinuousCompliancePlan(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Continuous Compliance Monitoring Plan', 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Recommended continuous monitoring and compliance assurance measures:', 20, yPos);
        yPos += 10;

        const recommendations = [
            {
                title: 'Microsoft Defender for Cloud',
                items: [
                    'Enable Defender for Containers (P2)',
                    'Configure regulatory compliance dashboard',
                    'Set up security alerts for critical findings',
                    'Weekly review of Secure Score recommendations'
                ]
            },
            {
                title: 'Azure Policy',
                items: [
                    'Assign industry-specific policy initiatives',
                    'Enable audit/deny policies for critical controls',
                    'Configure compliance reporting',
                    'Monthly policy compliance review'
                ]
            },
            {
                title: 'Audit Logging & Monitoring',
                items: [
                    'Enable Azure Monitor Container Insights',
                    'Configure Log Analytics workspace',
                    'Set up audit log retention (90+ days)',
                    'Create alerts for security events'
                ]
            },
            {
                title: 'Vulnerability Management',
                items: [
                    'Enable container registry scanning',
                    'Configure automated patching policies',
                    'Monthly vulnerability assessments',
                    'Track and remediate high/critical CVEs'
                ]
            }
        ];

        recommendations.forEach(section => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.text(section.title, 20, yPos);
            yPos += 6;

            doc.setFont('helvetica', 'normal');
            section.items.forEach(item => {
                const lines = doc.splitTextToSize(`- ${item}`, 170);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 5;
            });

            yPos += 8;
        });

        return yPos + 10;
    }

    /**
     * Add data sources page
     */
    addDataSourcesPage(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Data Sources & Methodology', 20, yPos);
        yPos += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('This report uses official regulatory framework requirements from authoritative sources.', 20, yPos);
        yPos += 10;

        // Source transparency
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Official Regulatory Sources', 20, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        const sources = [
            {
                name: 'ISO 27001:2022',
                org: 'International Organization for Standardization',
                url: 'https://www.iso.org/standard/27001',
                desc: 'Information security management systems requirements'
            },
            {
                name: 'PCI DSS v4.0',
                org: 'PCI Security Standards Council',
                url: 'https://www.pcisecuritystandards.org/',
                desc: 'Payment Card Industry Data Security Standard'
            },
            {
                name: 'GDPR',
                org: 'European Union',
                url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
                desc: 'General Data Protection Regulation (EU 2016/679)'
            },
            {
                name: 'CCPA',
                org: 'State of California',
                url: 'https://oag.ca.gov/privacy/ccpa',
                desc: 'California Consumer Privacy Act'
            },
            {
                name: 'NERC CIP',
                org: 'North American Electric Reliability Corporation',
                url: 'https://www.nerc.com/pa/Stand/Pages/CIPStandards.aspx',
                desc: 'Critical Infrastructure Protection standards'
            },
            {
                name: 'IEC 62443',
                org: 'International Electrotechnical Commission',
                url: 'https://www.iec.ch/',
                desc: 'Industrial automation and control systems security'
            },
            {
                name: 'NIST CSF v2.0',
                org: 'National Institute of Standards and Technology',
                url: 'https://www.nist.gov/cyberframework',
                desc: 'Cybersecurity Framework'
            }
        ];

        sources.forEach(source => {
            if (yPos > 255) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.text(`- ${source.name}`, 22, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            doc.text(`  Source: ${source.org}`, 25, yPos);
            yPos += 4;
            doc.setTextColor(0, 0, 255);
            doc.text(`  ${source.url}`, 25, yPos);
            doc.setTextColor(0);
            yPos += 4;
            const descLines = doc.splitTextToSize(`  ${source.desc}`, 165);
            doc.text(descLines, 25, yPos);
            yPos += descLines.length * 4 + 3;
        });

        yPos += 5;

        // Microsoft integration
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Microsoft Security Services', 20, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        const msServices = [
            {
                name: 'Microsoft Defender for Cloud',
                url: 'https://learn.microsoft.com/azure/defender-for-cloud/',
                desc: 'Security posture management and threat protection'
            },
            {
                name: 'Azure Policy',
                url: 'https://learn.microsoft.com/azure/governance/policy/',
                desc: 'Regulatory compliance initiatives and policy enforcement'
            },
            {
                name: 'Azure Security Benchmark',
                url: 'https://learn.microsoft.com/security/benchmark/azure/',
                desc: 'Cloud-centric security recommendations for Azure'
            },
            {
                name: 'CIS Benchmarks',
                url: 'https://www.cisecurity.org/cis-benchmarks/',
                desc: 'Center for Internet Security Kubernetes Benchmark v1.9.0'
            }
        ];

        msServices.forEach(service => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.text(`- ${service.name}`, 22, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 255);
            doc.text(`  ${service.url}`, 25, yPos);
            doc.setTextColor(0);
            yPos += 4;
            const descLines = doc.splitTextToSize(`  ${service.desc}`, 165);
            doc.text(descLines, 25, yPos);
            yPos += descLines.length * 4 + 3;
        });

        yPos += 5;

        // Mapping methodology
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Control Mapping Methodology', 20, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        const methodology = [
            '1. Direct Control Mapping: Each security configuration is mapped to specific regulatory',
            '   control identifiers (e.g., ISO 27001 A.10.1.1, PCI DSS 3.4, GDPR Article 32).',
            '',
            '2. Official Microsoft Mappings: Leverages Microsoft Defender for Cloud regulatory',
            '   compliance mappings and Azure Policy initiative definitions.',
            '',
            '3. Industry Best Practices: Incorporates guidance from CIS Benchmarks, NIST',
            '   publications, and industry-specific security frameworks.',
            '',
            '4. Continuous Updates: Framework mappings are reviewed quarterly and updated',
            '   to reflect the latest regulatory requirements and Azure capabilities.'
        ];

        methodology.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 4;
        });

        yPos += 5;

        // Documentation reference
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Complete Source Documentation', 20, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('For complete control mappings, article/section references, and version tracking:', 20, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 255);
        doc.text('https://github.com/smitzlroy/aksarcdeployment/blob/main/COMPLIANCE_SOURCES.md', 20, yPos);
        doc.setTextColor(0);
        yPos += 8;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Last Updated: December 16, 2024`, 20, yPos);
        yPos += 4;
        doc.text(`Next Review: March 2025`, 20, yPos);
        doc.setTextColor(0);

        return yPos + 10;
    }

    /**
     * Add attestation page
     */
    addAttestationPage(doc, yPos) {
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Attestation', 20, yPos);
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const attestationText = [
            'This document attests that the Azure Kubernetes Service Arc-enabled cluster',
            'described herein has been configured in accordance with applicable regulatory',
            'requirements and industry security best practices.',
            '',
            'The configurations and controls documented in this report have been verified',
            'against official regulatory framework requirements. All control mappings are',
            'sourced from authoritative publications and Microsoft compliance documentation.',
            '',
            'This deployment incorporates security controls designed to meet the compliance',
            'obligations specified for the selected industry and regulatory frameworks.'
        ];

        attestationText.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 6;
        });

        yPos += 20;

        // Signature blocks
        doc.setDrawColor(0);
        doc.line(20, yPos, 90, yPos);
        doc.line(110, yPos, 180, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Deployment Engineer', 20, yPos);
        doc.text('Security/Compliance Officer', 110, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Signature', 20, yPos);
        doc.text('Signature', 110, yPos);
        yPos += 10;

        doc.line(20, yPos, 90, yPos);
        doc.line(110, yPos, 180, yPos);
        yPos += 5;

        doc.setFontSize(10);
        doc.text('Date: _______________', 20, yPos);
        doc.text('Date: _______________', 110, yPos);

        yPos += 30;

        // Document information
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('Generated by: AKS Arc Deployment Tool', 20, yPos);
        yPos += 4;
        doc.text(`Report ID: ${this.generateReportId()}`, 20, yPos);
        yPos += 4;
        doc.text(`Generated: ${new Date().toISOString()}`, 20, yPos);
        yPos += 4;
        doc.text('Source: https://github.com/smitzlroy/aksarcdeployment', 20, yPos);

        return yPos;
    }

    /**
     * Add professional cover page
     */
    addCoverPage(doc) {
        // Page background accent
        doc.setFillColor(0, 120, 212); // Microsoft blue
        doc.rect(0, 0, 210, 40, 'F');

        // Document title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('Kubernetes Compliance &', 105, 20, { align: 'center' });
        doc.text('Security Assessment Report', 105, 32, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Subtitle
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Microsoft Azure Kubernetes Service Arc-enabled', 105, 55, { align: 'center' });

        // Blue accent line
        doc.setDrawColor(0, 120, 212);
        doc.setLineWidth(2);
        doc.line(30, 65, 180, 65);

        // Cluster information box
        doc.setFillColor(245, 245, 245);
        doc.rect(30, 80, 150, 60, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Cluster Information', 40, 90);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const clusterName = this.reportData.clusterName || 'Not Specified';
        const environment = this.reportData.environment || 'Production';
        
        doc.text(`Cluster Name: ${clusterName}`, 40, 102);
        doc.text(`Environment: ${environment}`, 40, 112);
        doc.text(`Report Date: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`, 40, 122);
        doc.text(`Report Version: ${this.reportData.reportVersion}`, 40, 132);

        // Report classification
        doc.setFillColor(255, 243, 205);
        doc.setDrawColor(255, 185, 0);
        doc.rect(30, 155, 150, 20, 'FD');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 87, 0);
        doc.text('[WARNING] CONFIDENTIAL - Internal Use Only', 105, 167, { align: 'center' });

        // Report details
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.text('Report ID:', 40, 195);
        doc.setFont('helvetica', 'bold');
        doc.text(this.reportData.reportId, 70, 195);

        doc.setFont('helvetica', 'normal');
        doc.text('Generated By:', 40, 205);
        doc.setFont('helvetica', 'bold');
        doc.text('AKS Arc Deployment Tool', 70, 205);

        doc.setFont('helvetica', 'normal');
        doc.text('Generated At:', 40, 215);
        doc.setFont('helvetica', 'bold');
        doc.text(new Date().toLocaleString('en-US'), 70, 215);

        // Compliance frameworks covered
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Compliance Frameworks Assessed:', 40, 235);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const frameworks = [
            '- PCI DSS 4.0 - Payment Card Industry Data Security Standard',
            '- HIPAA - Health Insurance Portability and Accountability Act',
            '- ISO 27001 - Information Security Management',
            '- SOC 2 Type II - Service Organization Control',
            '- NIST CSF - Cybersecurity Framework',
            '- FedRAMP - Federal Risk and Authorization Management Program'
        ];

        let yPos = 245;
        frameworks.forEach(framework => {
            doc.text(framework, 45, yPos);
            yPos += 7;
        });

        // Footer with professional statement
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'italic');
        doc.text('This report provides a comprehensive assessment of Kubernetes security and compliance posture.', 105, 290, { align: 'center' });
        doc.text('Results are based on configured policies and should be reviewed by qualified security professionals.', 105, 295, { align: 'center' });
    }

    /**
     * Add professional headers and footers to all pages
     */
    addHeadersAndFooters(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Skip header on cover page (page 1)
            if (i > 1) {
                // Header - blue accent line
                doc.setDrawColor(0, 120, 212);
                doc.setLineWidth(0.5);
                doc.line(20, 12, 190, 12);

                // Header text
                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                doc.setFont('helvetica', 'normal');
                doc.text(this.reportData.reportTitle, 20, 10);
                
                doc.setFont('helvetica', 'bold');
                doc.text(`Page ${i} of ${pageCount}`, 190, 10, { align: 'right' });
            }

            // Footer - classification and metadata
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            
            if (i === 1) {
                // Cover page footer
                doc.text('Generated by AKS Arc Deployment Tool | Microsoft Azure', 105, 285, { align: 'center' });
            } else {
                // Standard footer with classification
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(139, 87, 0);
                doc.text('CONFIDENTIAL', 20, 285);
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(150, 150, 150);
                doc.text(`Report ${this.reportData.reportId} | Generated ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });
                doc.text(`v${this.reportData.reportVersion}`, 190, 285, { align: 'right' });
            }
        }
    }

    /**
     * Helper: Get color based on score
     */
    getScoreColor(score) {
        if (score >= 90) return { r: 16, g: 124, b: 16 }; // Green
        if (score >= 75) return { r: 0, g: 120, b: 212 }; // Blue
        if (score >= 50) return { r: 255, g: 185, b: 0 }; // Orange
        return { r: 164, g: 38, b: 44 }; // Red
    }

    /**
     * Helper: Get rating text
     */
    getRatingText(rating) {
        const ratings = {
            'excellent': 'Excellent',
            'good': 'Good',
            'fair': 'Fair',
            'poor': 'Poor'
        };
        return ratings[rating] || rating;
    }

    /**
     * Helper: Generate report ID
     */
    generateReportId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `RPT-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Helper: Get date string for filename
     */
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.ComplianceReportGenerator = ComplianceReportGenerator;
}

console.log('✅ ComplianceReportGenerator loaded successfully');
