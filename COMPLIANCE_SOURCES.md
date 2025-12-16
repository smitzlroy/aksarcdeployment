# Compliance Framework Sources & References

## 📚 Official Sources for Regulatory Frameworks

This document provides authoritative sources for all compliance frameworks referenced in the AKS Arc Deployment Tool.

---

## 🏭 Manufacturing Industry

### ISO/IEC 27001:2022 - Information Security Management
**Official Source**: International Organization for Standardization (ISO)
- **Publisher**: ISO/IEC JTC 1/SC 27
- **URL**: https://www.iso.org/standard/27001
- **Purchase**: https://www.iso.org/standard/82875.html
- **Free Resources**: 
  - Microsoft ISO 27001 Compliance: https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-27001
  - Azure ISO 27001 Blueprint: https://learn.microsoft.com/en-us/azure/governance/blueprints/samples/iso-27001-shared/

**Relevant Controls for Kubernetes/AKS**:
- **A.9.1.1** - Access control policy (RBAC)
- **A.9.1.2** - Access to networks and network services (Network Policies)
- **A.9.2.1** - User registration and de-registration (Identity Management)
- **A.10.1.1** - Policy on the use of cryptographic controls (Encryption at Rest)
- **A.10.1.2** - Key management (Azure Key Vault Integration)
- **A.12.3.1** - Information backup (Backup Configuration)
- **A.12.4.1** - Event logging (Audit Logging)
- **A.12.4.3** - Administrator and operator logs (Audit Logging)
- **A.13.1.1** - Network controls (Network Policies)
- **A.13.1.3** - Segregation in networks (Network Segmentation)
- **A.16.1.2** - Reporting information security events (Monitoring)
- **A.17.1.1** - Planning information security continuity (HA Control Plane)
- **A.17.1.2** - Implementing information security continuity (Backup)
- **A.17.1.3** - Verify, review and evaluate information security continuity (Disaster Recovery Testing)
- **A.17.2.1** - Availability of information processing facilities (Availability Sets)

### IEC 62443 - Industrial Automation and Control Systems Security
**Official Source**: International Electrotechnical Commission (IEC)
- **Publisher**: IEC TC 65/WG 10
- **URL**: https://webstore.iec.ch/publication/7030
- **Series Overview**: https://www.iec.ch/cyber-security
- **Azure Resources**: https://learn.microsoft.com/en-us/azure/architecture/industries/manufacturing/iec-62443-deployment

**Relevant Security Requirements (SR)**:
- **SR 1.1-1.13** - Identification and authentication control
- **SR 2.1-2.12** - Use control
- **SR 3.1-3.4** - System integrity (Network Segmentation, Secure Boot)
- **SR 5.1-5.4** - Restricted data flow (Network Policies, Firewall)
- **SR 7.1-7.8** - Resource availability (HA, Load Balancing)

**IEC 62443-4-2 Technical Security Requirements**:
- Network segmentation between OT and IT zones
- Defense in depth architecture
- Access control and authentication

### TISAX (Trusted Information Security Assessment Exchange)
**Official Source**: ENX Association
- **Publisher**: ENX Association (European Network Exchange)
- **URL**: https://portal.enx.com/en-US/TISAX/
- **Information Security Catalogue**: Based on ISO 27001/27002 + automotive-specific controls
- **Assessment Criteria**: https://portal.enx.com/en-US/TISAX/tisaxassessmentresults/

**Key Focus Areas**:
- **Information Security** - Based on ISO 27001 controls
- **Data Protection** - GDPR compliance for automotive data
- **Prototype Protection** - Confidentiality for sensitive automotive IP

---

## 🛒 Retail Industry

### PCI DSS 4.0 (Payment Card Industry Data Security Standard)
**Official Source**: PCI Security Standards Council
- **Publisher**: PCI SSC (Founded by Visa, Mastercard, American Express, Discover, JCB)
- **Current Version**: PCI DSS v4.0 (March 2022)
- **URL**: https://www.pcisecuritystandards.org/document_library/
- **Free Download**: https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Standard/PCI-DSS-v4_0.pdf
- **Azure Compliance**: https://learn.microsoft.com/en-us/compliance/regulatory/offering-pci-dss

**Requirement Mappings for Kubernetes**:
- **Requirement 1**: Install and maintain network security controls
  - 1.1: Processes and mechanisms for network security controls
  - 1.2: Network security controls (NSGs, Network Policies)
  - 1.3: Network access to and from cardholder data environment restricted
  - 11.3: External and internal vulnerabilities regularly identified (Network Segmentation)

- **Requirement 2**: Apply secure configurations
  - 2.2: Systems and networks configured securely (CIS Benchmarks)
  - 10.5: Secure backup of audit log files

- **Requirement 3**: Protect stored account data
  - 3.1: Account data storage kept to minimum necessary
  - 3.4: Account data rendered unreadable (Encryption at Rest)
  - 3.5: Cryptographic keys protected (Key Vault)
  - 9.5: Physical access to stored account data restricted

- **Requirement 7**: Restrict access to system components
  - 7.1: Access to system components limited by business need-to-know (RBAC)
  - 7.2: Access to system components and data granted to users

- **Requirement 8**: Identify users and authenticate access
  - 8.1: User identification and authentication (Azure AD Integration)

- **Requirement 10**: Log and monitor all access
  - 10.1: Processes for logging and monitoring
  - 10.2: Audit logs implemented to support anomaly detection
  - 10.2.1: Logs capture required events (Audit Logging)
  - 10.3: Audit logs protected from destruction and unauthorized modifications
  - 12.10.1: Incident response plan created and implemented (Disaster Recovery)

### GDPR (General Data Protection Regulation)
**Official Source**: European Union
- **Publisher**: European Parliament and Council
- **Regulation**: Regulation (EU) 2016/679
- **URL**: https://gdpr-info.eu/
- **Official Text**: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- **Azure GDPR**: https://learn.microsoft.com/en-us/compliance/regulatory/gdpr

**Relevant Articles for Data Processing Systems**:
- **Article 5** - Principles relating to processing of personal data
  - Integrity and confidentiality (security)
  
- **Article 25** - Data protection by design and by default
  - Security measures built into systems
  
- **Article 30** - Records of processing activities (Audit Logging)

- **Article 32** - Security of processing (PRIMARY ARTICLE)
  - **32(1)(a)**: Pseudonymisation and encryption of personal data (Encryption at Rest)
  - **32(1)(b)**: Ability to ensure ongoing confidentiality, integrity, availability (HA, RBAC)
  - **32(1)(c)**: Ability to restore availability and access in timely manner (Backup)
  - **32(1)(d)**: Regular testing and evaluation of security measures (Monitoring)

- **Article 33** - Notification of personal data breach (Monitoring, Alerting)

- **Article 35** - Data protection impact assessment (DPIA)

### CCPA (California Consumer Privacy Act)
**Official Source**: State of California
- **Authority**: California Attorney General
- **Effective**: January 1, 2020 (Amended by CPRA 2023)
- **URL**: https://oag.ca.gov/privacy/ccpa
- **Full Text**: https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5
- **Azure CCPA**: https://learn.microsoft.com/en-us/compliance/regulatory/offering-ccpa

**Relevant Sections for Infrastructure**:
- **§1798.100(d)**: Right to disclosure of categories of data collected (Audit Logging)
- **§1798.150**: Private right of action for data breaches
  - Encryption requirements to avoid liability (Encryption at Rest)
  - Reasonable security measures required (RBAC, Monitoring)

---

## ⚡ Energy & Utilities Industry

### NERC CIP (Critical Infrastructure Protection)
**Official Source**: North American Electric Reliability Corporation
- **Publisher**: NERC (Overseen by FERC)
- **URL**: https://www.nerc.com/pa/Stand/Pages/CIPStandards.aspx
- **Current Standards**: NERC CIP v5/v6/v7
- **Azure Guidance**: https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-nerc

**Relevant Standards for Kubernetes Infrastructure**:
- **CIP-002-5.1**: BES Cyber System Categorization
  - Identify and categorize BES Cyber Systems

- **CIP-004-6**: Personnel & Training
  - Access management and authorization (RBAC)

- **CIP-005-6**: Electronic Security Perimeter(s)
  - R1: Electronic Security Perimeter (Network Segmentation)
  - Firewall rules and access control (Network Policies)

- **CIP-007-6**: System Security Management
  - R4: Security event monitoring (Audit Logging, Monitoring)
  - Patch management (Regular Kubernetes updates)

- **CIP-009-6**: Recovery Plans for BES Cyber Systems
  - R1: Backup and restore capabilities (Backup Configuration)
  - Business continuity (HA Control Plane)

- **CIP-010-3**: Configuration Change Management
  - Baseline configurations
  - Change authorization and documentation

### IEC 62351 - Power Systems Management and Information Exchange
**Official Source**: International Electrotechnical Commission
- **Publisher**: IEC TC 57
- **URL**: https://webstore.iec.ch/publication/6912
- **Series**: IEC 62351 Parts 1-14
- **Overview**: https://www.iec.ch/smartenergy/standards

**Key Parts for Cyber Security**:
- **Part 3**: Profiles including TCP/IP (Network Security)
- **Part 4**: Profiles including MMS (Authentication)
- **Part 6**: Security for IEC 61850 (Encryption at Rest/Transit)
- **Part 8**: Role-based access control (RBAC)
- **Part 11**: Security for XML files (Data Integrity)

### NIST Cybersecurity Framework (CSF) v2.0
**Official Source**: National Institute of Standards and Technology
- **Publisher**: NIST (U.S. Department of Commerce)
- **Current Version**: CSF 2.0 (February 2024)
- **URL**: https://www.nist.gov/cyberframework
- **Download**: https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf
- **Azure Mapping**: https://learn.microsoft.com/en-us/azure/governance/policy/samples/nist-csf

**Core Functions & Relevant Subcategories**:

1. **IDENTIFY**
   - ID.AM: Asset Management
   - ID.RA: Risk Assessment

2. **PROTECT**
   - PR.AC: Identity Management and Access Control (RBAC)
   - PR.DS: Data Security (Encryption at Rest)
   - PR.IP-9: Response and recovery plans (Backup, DR)
   - PR.PT-1: Audit logs (Audit Logging)
   - PR.PT-5: Mechanisms to achieve resilience (HA Control Plane)

3. **DETECT**
   - DE.AE-3: Event data aggregated (Centralized Logging)
   - DE.AE-5: Incident alert thresholds (Auto-scaling)
   - DE.CM-1: Network monitored (Monitoring)
   - DE.CM-3: Personnel activity monitored (Audit Logging)
   - DE.CM-7: Monitoring for unauthorized activity (Network Policies)

4. **RESPOND**
   - RS.AN: Analysis performed
   - RS.MI: Mitigation activities

5. **RECOVER**
   - RC.RP: Recovery planning (Backup Configuration)

### API Standard 1164 - Pipeline SCADA Security
**Official Source**: American Petroleum Institute
- **Publisher**: API (American Petroleum Institute)
- **Standard**: API 1164 Third Edition (June 2021)
- **URL**: https://www.api.org/products-and-services/api-standards
- **Purchase**: https://www.techstreet.com/api/standards/api-std-1164

**Key Security Areas**:
- **Section 5.2**: Network Architecture and Segmentation (Network Segmentation)
- **Section 7.3**: Data Backup and Recovery (Backup Configuration)
- **Section 8**: Access Control (RBAC)
- **Section 9**: Audit and Accountability (Audit Logging)

---

## 🛡️ Microsoft Security Services Integration

### Microsoft Defender for Cloud
**Official Documentation**: https://learn.microsoft.com/en-us/azure/defender-for-cloud/

**Relevant Features for AKS Arc**:
1. **Regulatory Compliance Dashboard**
   - Built-in compliance assessments for frameworks
   - URL: https://learn.microsoft.com/en-us/azure/defender-for-cloud/regulatory-compliance-dashboard

2. **Secure Score**
   - Security posture measurement
   - URL: https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-score-security-controls

3. **Defender for Containers**
   - Kubernetes-specific security recommendations
   - URL: https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-introduction

4. **Defender for Kubernetes**
   - Runtime threat detection
   - URL: https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-kubernetes-introduction

### Azure Policy
**Official Documentation**: https://learn.microsoft.com/en-us/azure/governance/policy/

**Kubernetes/AKS-Specific Policies**:
1. **Azure Policy for Kubernetes**
   - URL: https://learn.microsoft.com/en-us/azure/governance/policy/concepts/policy-for-kubernetes

2. **Built-in Policy Initiatives**:
   - **Kubernetes cluster pod security baseline standards for Linux-based workloads**
   - **Kubernetes cluster pod security restricted standards for Linux-based workloads**
   - URL: https://learn.microsoft.com/en-us/azure/aks/use-azure-policy

3. **Regulatory Compliance Initiatives**:
   - PCI DSS v4.0
   - ISO 27001:2013
   - NIST SP 800-53 Rev. 5
   - HIPAA/HITRUST 9.2
   - URL: https://learn.microsoft.com/en-us/azure/governance/policy/samples/built-in-initiatives#regulatory-compliance

### CIS Benchmarks for Kubernetes
**Official Source**: Center for Internet Security (CIS)
- **Publisher**: CIS (Center for Internet Security)
- **Benchmark**: CIS Kubernetes Benchmark v1.9.0
- **URL**: https://www.cisecurity.org/benchmark/kubernetes
- **Download**: https://downloads.cisecurity.org/#/ (Free registration required)
- **Azure Implementation**: https://learn.microsoft.com/en-us/azure/aks/cis-kubernetes

**Key Control Areas**:
1. **Control Plane Components**
   - API Server configuration
   - Controller Manager settings
   - Scheduler configuration
   - etcd security

2. **Worker Node Configuration**
   - Kubelet settings
   - Worker node security

3. **Policies**
   - RBAC and service accounts (maps to our RBAC check)
   - Pod Security Standards (maps to Network Policies)
   - Network policies (maps to Network Policies check)
   - Secrets management (maps to Encryption at Rest)

4. **Managed Services**
   - AKS-specific recommendations

### Azure Security Benchmark
**Official Source**: Microsoft
- **Current Version**: Azure Security Benchmark v3.0
- **URL**: https://learn.microsoft.com/en-us/security/benchmark/azure/
- **Overview**: https://learn.microsoft.com/en-us/security/benchmark/azure/overview

**Relevant Controls for AKS**:
- **NS (Network Security)**: Network Segmentation, Network Policies
- **IM (Identity Management)**: RBAC, Azure AD Integration
- **PA (Privileged Access)**: JIT Access, PIM
- **DP (Data Protection)**: Encryption at Rest, Backup
- **LT (Logging and Threat Detection)**: Audit Logging, Monitoring
- **BC (Backup and Recovery)**: Backup Configuration, DR

---

## 📊 Control Mapping Methodology

Our tool maps security configurations to regulatory requirements using:

1. **Direct Control Mapping**: Specific regulatory control IDs (e.g., PCI DSS 3.4, ISO 27001 A.10.1.1)

2. **Microsoft's Official Compliance Mappings**:
   - Azure Policy compliance initiatives
   - Defender for Cloud regulatory compliance
   - Microsoft Compliance Manager

3. **Industry Best Practices**:
   - CIS Benchmarks
   - NIST guidelines
   - Cloud Security Alliance (CSA) recommendations

4. **Vendor Documentation**:
   - Azure Arc documentation
   - AKS security best practices
   - Azure Local security guidance

---

## 🔄 Keeping Data Current

**Update Frequency**: Quarterly reviews

**Data Sources Monitored**:
1. Microsoft Learn documentation updates
2. Azure Policy new initiatives
3. Regulatory framework version changes
4. CIS Benchmark updates
5. Defender for Cloud new assessments

**Version Control**: All control mappings include:
- Framework version number
- Last verified date
- Source URL
- Microsoft documentation reference

---

## 📧 Questions or Updates?

If you find outdated information or need specific framework mappings:
- **Open an issue**: https://github.com/smitzlroy/aksarcdeployment/issues
- **Review source**: Check official framework documentation linked above
- **Verify with Microsoft**: Consult Microsoft Compliance Manager or Defender for Cloud

---

**Last Updated**: December 16, 2024
**Next Review**: March 2025
