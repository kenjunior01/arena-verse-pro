import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PaymentDialogProps {
  tournamentId: string;
  amount: number;
  onSuccess: () => void;
}

export const PaymentDialog = ({ tournamentId, amount, onSuccess }: PaymentDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await supabase.functions.invoke("process-payment", {
        body: {
          tournamentId,
          userId: user.id,
          amount,
          paymentMethod,
          transactionId,
        },
      });

      if (error) throw error;

      toast.success("Pagamento processado com sucesso!");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Pagar Taxa (${amount})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagamento da Taxa de Entrada</DialogTitle>
          <DialogDescription>
            Complete o pagamento para confirmar sua inscrição no torneio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Valor a Pagar</Label>
            <div className="text-3xl font-bold text-primary">${amount}</div>
          </div>

          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                  PayPal
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                  Cartão de Crédito
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex-1 cursor-pointer">
                  PIX
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>Confirmar Pagamento</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
