import React from 'react';
import Card from '../components/Card';
import { FaServer, FaGlobe, FaRocket } from 'react-icons/fa';

function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Welcome To PalC Fabric Manager</h1>
      <div className="flex flex-wrap gap-6">
        <Card
          title="Build Racks"
          description="Build the different types of racks that you will be deploying, operating, and managing in your network with NetFabric."
          icon={<FaServer />}
        />
        <Card
          title="Design the Network"
          description="Create a design for your architecture. Input the intent by choosing the services, the network structure, and build the overall design."
          icon={<FaGlobe />}
        />
        <Card
          title="Create and deploy Blueprint"
          description="Once a design has been finalized, deploy the blueprint to push the design into production, assign resources, build as described, and validate the network is working as intended."
          icon={<FaRocket />}
        />
      </div>
    </div>
  );
}

export default Dashboard;