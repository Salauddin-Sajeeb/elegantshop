import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface CustomerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contactData: ContactFormData) => void;
  product: Product | null;
}

export function CustomerContactModal({ isOpen, onClose, onSubmit, product }: CustomerContactModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data: ContactFormData & { interestedProducts: string[] }) => 
      api.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success!",
        description: "Product added to cart and contact information saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save contact information.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    if (!product) return;

    try {
      // Save customer contact information
      await createCustomerMutation.mutateAsync({
        ...data,
        interestedProducts: [product.id],
      });

      // Call the onSubmit callback to add to cart
      onSubmit(data);
      
      // Reset form and close modal
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting contact form:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Contact Information</DialogTitle>
          <p className="text-center text-slate-600 dark:text-slate-400">
            Please provide your contact details to add this item to your cart
          </p>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter your full name"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter your email"
              className="mt-1"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              placeholder="Enter your phone number"
              className="mt-1"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
