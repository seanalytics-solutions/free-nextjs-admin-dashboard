import { getGuiaById } from "@/actions/guias";
import GuiaDetails from "@/components/guias/GuiaDetails";
import { notFound } from "next/navigation";

export default async function GuiaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guia = await getGuiaById(id);

  if (!guia) {
    notFound();
  }

  return <GuiaDetails guia={guia} />;
}
