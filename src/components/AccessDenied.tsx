import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

/** Écran affiché quand un rôle tente d'ouvrir une section non autorisée. */
const AccessDenied = ({
  title = "Section non autorisée",
  description = "Votre rôle ne vous donne pas accès à cette section du tableau de bord.",
}: AccessDeniedProps) => (
  <Card className="border-destructive/30">
    <CardContent className="py-12 flex flex-col items-center text-center gap-3">
      <div className="p-3 rounded-full bg-destructive/10">
        <ShieldAlert className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </CardContent>
  </Card>
);

export default AccessDenied;
