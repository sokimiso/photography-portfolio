"use client";

import { OrderResult } from "@hooks/useGlobalSearch";
import { glassBoxStyle } from "@/lib/constants/orders";
import { useRouter } from "next/navigation";
import { useTexts } from "@/context/TextContext";
import { Button } from "@/components/ui/button";

type Props = {
  pendingOrders: OrderResult[];
  loading: boolean;

};

export default function PendingOrdersPanel({ pendingOrders, loading }: Props) {

  const router = useRouter(); // <-- init router
  const texts = useTexts();

  const handleViewOrders = () => {
    router.push("/dashboard/orders?status=PENDING"); // navigate programmatically
  };

   

 return (
    <div className={`p-4 mb-4 rounded-xl ${glassBoxStyle}`}>
      <h2 className="text-lg font-bold mb-2 cursor-default">{texts.dashboard?.ordersPage?.pendingOrdersTitle} {pendingOrders.length > 0 && `: ${pendingOrders.length}`}</h2>

        {pendingOrders.length > 0 ? (
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={handleViewOrders} // <-- attaching click handler
        >
          {texts.buttons.show}
        </Button>
        ) : (
            <div className="text-gray-500 dark:text-gray-400">
              {texts.dashboard?.ordersPage?.noOrdersMessage || "No orders pending."}
            </div>
        )}
    </div>
  );
}
