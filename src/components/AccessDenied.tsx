import { ShieldAlert, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

/**
 * Écran affiché quand un rôle tente d'ouvrir une section non autorisée.
 * Ne divulgue jamais le rôle requis ni le contenu protégé : message générique
 * + redirection vers le tableau de bord auquel l'utilisateur a réellement droit.
 */
const AccessDenied = ({
  title = "Section non autorisée",
  description = "Vous n'avez pas les droits nécessaires pour afficher cette section.",
}: AccessDeniedProps) => {
  const navigate = useNavigate();
  const { getDashboardPath } = useAuth();
  const target = getDashboardPath();

  return (
    <Card className="border-destructive/30">
      <CardContent className="py-12 flex flex-col items-center text-center gap-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
          <p className="text-xs text-muted-foreground">
            Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur de la plateforme.
          </p>
        </div>
        <Button onClick={() => navigate(target, { replace: true })} className="gap-2">
          Aller à mon tableau de bord
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccessDenied;
