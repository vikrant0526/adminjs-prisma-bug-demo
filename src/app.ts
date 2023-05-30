import { PrismaClient } from "@prisma/client";
import { DMMFClass } from "@prisma/client/runtime";
import Fastify from "fastify";

const prisma = new PrismaClient();

const PORT = 3000;

const start = async () => {
  const AdminJS = (await import("adminjs")).AdminJS;
  const AdminJSFastify = await import("@adminjs/fastify");
  const { Database, Resource } = await import("@adminjs/prisma");

  AdminJS.registerAdapter({
    Resource: Resource,
    Database: Database,
  });

  const app = Fastify();
  const dmmf = (prisma as any)._baseDmmf as DMMFClass;
  const adminOptions = {
    // We pass Publisher to `resources`
    resources: [
      {
        resource: { model: dmmf.modelMap.Publisher, client: prisma },
        options: {},
      },
    ],
  };
  // Please note that some plugins don't need you to create AdminJS instance manually,
  // instead you would just pass `adminOptions` into the plugin directly,
  // an example would be "@adminjs/hapi"
  const admin = new AdminJS(adminOptions);

  await AdminJSFastify.buildRouter(admin, app);

  app.listen({ port: PORT }, (err, addr) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
    }
  });
};

start();
