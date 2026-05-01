import { connectToDatabase } from "@/lib/db/mongodb";
import { ProjectModel } from "@/lib/db/models";

export interface CRMData {
  customers: Array<{
    id: string;
    name: string;
    email: string;
    company: string;
    dealValue: number;
    status: "lead" | "prospect" | "customer";
  }>;
  pipeline: {
    leads: number;
    prospects: number;
    customers: number;
    totalValue: number;
  };
}

export interface ShopifyData {
  products: Array<{
    id: string;
    name: string;
    price: number;
    inventory: number;
    category: string;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: "pending" | "shipped" | "delivered";
    date: string;
  }>;
  stats: {
    totalProducts: number;
    totalRevenue: number;
    pendingOrders: number;
  };
}

// Mock CRM data
export function getMockCRMData(): CRMData {
  return {
    customers: [
      {
        id: "c1",
        name: "John Smith",
        email: "john@acme.com",
        company: "Acme Corp",
        dealValue: 50000,
        status: "customer",
      },
      {
        id: "c2",
        name: "Sarah Johnson",
        email: "sarah@techstart.io",
        company: "TechStart",
        dealValue: 25000,
        status: "prospect",
      },
      {
        id: "c3",
        name: "Mike Wilson",
        email: "mike@bigco.com",
        company: "BigCo Inc",
        dealValue: 100000,
        status: "lead",
      },
      {
        id: "c4",
        name: "Emily Davis",
        email: "emily@startup.co",
        company: "Startup Co",
        dealValue: 15000,
        status: "customer",
      },
    ],
    pipeline: {
      leads: 12,
      prospects: 8,
      customers: 25,
      totalValue: 450000,
    },
  };
}

// Mock Shopify data
export function getMockShopifyData(): ShopifyData {
  return {
    products: [
      {
        id: "p1",
        name: "Premium Widget",
        price: 99.99,
        inventory: 150,
        category: "Electronics",
      },
      {
        id: "p2",
        name: "Basic Gadget",
        price: 49.99,
        inventory: 300,
        category: "Electronics",
      },
      {
        id: "p3",
        name: "Pro Tool Set",
        price: 199.99,
        inventory: 75,
        category: "Tools",
      },
      {
        id: "p4",
        name: "Starter Kit",
        price: 29.99,
        inventory: 500,
        category: "Accessories",
      },
    ],
    recentOrders: [
      {
        id: "o1",
        customerName: "Alice Brown",
        total: 299.97,
        status: "delivered",
        date: "2024-01-15",
      },
      {
        id: "o2",
        customerName: "Bob Green",
        total: 149.98,
        status: "shipped",
        date: "2024-01-16",
      },
      {
        id: "o3",
        customerName: "Carol White",
        total: 99.99,
        status: "pending",
        date: "2024-01-17",
      },
    ],
    stats: {
      totalProducts: 45,
      totalRevenue: 125000,
      pendingOrders: 8,
    },
  };
}

export async function getCRMData(projectId: string): Promise<CRMData | null> {
  await connectToDatabase();

  const project = await ProjectModel.findById(projectId);

  if (!project?.integrations.crm) {
    return null;
  }

  return getMockCRMData();
}

export async function getShopifyData(
  projectId: string
): Promise<ShopifyData | null> {
  await connectToDatabase();

  const project = await ProjectModel.findById(projectId);

  if (!project?.integrations.shopify) {
    return null;
  }

  return getMockShopifyData();
}

export async function enrichAIContext(projectId: string): Promise<string> {
  const crmData = await getCRMData(projectId);
  const shopifyData = await getShopifyData(projectId);

  const contextParts: string[] = [];

  if (crmData) {
    contextParts.push(`
## CRM Integration Data
You have access to CRM data. Here's the current state:
- Total Customers: ${crmData.pipeline.customers}
- Active Leads: ${crmData.pipeline.leads}
- Prospects: ${crmData.pipeline.prospects}
- Pipeline Value: $${crmData.pipeline.totalValue.toLocaleString()}

Recent Contacts:
${crmData.customers
  .map(
    (c) => `- ${c.name} (${c.company}): ${c.status}, Deal Value: $${c.dealValue}`
  )
  .join("\n")}
`);
  }

  if (shopifyData) {
    contextParts.push(`
## Shopify Integration Data
You have access to Shopify store data. Here's the current state:
- Total Products: ${shopifyData.stats.totalProducts}
- Total Revenue: $${shopifyData.stats.totalRevenue.toLocaleString()}
- Pending Orders: ${shopifyData.stats.pendingOrders}

Top Products:
${shopifyData.products.map((p) => `- ${p.name}: $${p.price} (${p.inventory} in stock)`).join("\n")}

Recent Orders:
${shopifyData.recentOrders.map((o) => `- ${o.customerName}: $${o.total} (${o.status})`).join("\n")}
`);
  }

  return contextParts.join("\n\n");
}
