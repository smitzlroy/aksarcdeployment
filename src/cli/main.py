"""
CLI interface for AKS Arc deployment tool
"""

import click
import json
from pathlib import Path
from src.catalog import CatalogService
from src.planner import Planner
from src.models import WorkloadRequirements, WorkloadType
from src.generator import BicepGenerator, ARMGenerator, TerraformGenerator


@click.group()
@click.version_option(version='0.1.0')
def cli():
    """AKS Arc Deployment Tool CLI"""
    pass


@cli.command()
@click.option('--workload', type=click.Choice(['video-analytics', 'ai-inference', 'general-purpose', 'custom']),
              default='general-purpose', help='Workload type')
@click.option('--cpu', type=int, default=8, help='CPU cores required')
@click.option('--memory', type=int, default=32, help='Memory in GB')
@click.option('--gpu/--no-gpu', default=False, help='Require GPU')
@click.option('--cluster-name', required=True, help='Name of the AKS cluster')
@click.option('--resource-group', required=True, help='Azure resource group')
@click.option('--location', default='eastus', help='Azure region')
@click.option('--custom-location', required=True, help='Azure Arc custom location')
@click.option('--output', type=click.Path(), help='Output file path')
def plan(workload, cpu, memory, gpu, cluster_name, resource_group, location, custom_location, output):
    """Create a deployment plan"""
    click.echo(f"Creating deployment plan for {workload}...")
    
    # Create workload requirements
    workload_req = WorkloadRequirements(
        workload_type=WorkloadType(workload.replace('-', '_').lower() if workload != 'custom' else 'custom'),
        cpu_cores=cpu,
        memory_gb=memory,
        gpu_required=gpu
    )
    
    # Initialize services
    catalog = CatalogService()
    planner = Planner(catalog)
    
    # Create plan
    deployment_plan = planner.create_plan(
        workload=workload_req,
        cluster_name=cluster_name,
        resource_group=resource_group,
        location=location,
        custom_location=custom_location
    )
    
    # Display validation results
    validation = deployment_plan.validation_result
    if validation:
        if validation.errors:
            click.echo(click.style("Errors:", fg='red'))
            for error in validation.errors:
                click.echo(f"  - {error}")
        
        if validation.warnings:
            click.echo(click.style("Warnings:", fg='yellow'))
            for warning in validation.warnings:
                click.echo(f"  - {warning}")
        
        if validation.recommendations:
            click.echo(click.style("Recommendations:", fg='blue'))
            for rec in validation.recommendations:
                click.echo(f"  - {rec}")
    
    if output:
        output_path = Path(output)
        output_path.write_text(json.dumps({
            'cluster': {
                'name': deployment_plan.cluster_config.cluster_name,
                'kubernetes_version': deployment_plan.cluster_config.kubernetes_version,
                'control_plane_count': deployment_plan.cluster_config.control_plane_count
            },
            'node_pools': [
                {
                    'name': pool.name,
                    'vm_size': pool.vm_size,
                    'count': pool.node_count,
                    'os_type': pool.os_type.value
                }
                for pool in deployment_plan.cluster_config.node_pools
            ]
        }, indent=2))
        click.echo(f"Plan saved to {output}")
    
    click.echo(click.style("✓ Plan created successfully!", fg='green'))


@cli.command()
def catalog_info():
    """Show catalog information"""
    catalog = CatalogService()
    info = catalog.get_catalog_info()
    
    click.echo("Catalog Information:")
    click.echo(f"  Target: {info['target']}")
    click.echo(f"  Version: {info['version']}")
    click.echo(f"  Last Updated: {info['last_updated']}")
    click.echo(f"  Is Outdated: {info['is_outdated']}")
    
    if info['is_outdated']:
        click.echo(click.style("⚠ Catalog is more than 30 days old. Consider refreshing.", fg='yellow'))


@cli.command()
def catalog_refresh():
    """Refresh catalog from Azure APIs"""
    click.echo("Refreshing catalog...")
    catalog = CatalogService()
    success = catalog.refresh()
    
    if success:
        click.echo(click.style("✓ Catalog refreshed successfully!", fg='green'))
    else:
        click.echo(click.style("✗ Failed to refresh catalog", fg='red'))


if __name__ == '__main__':
    cli()
