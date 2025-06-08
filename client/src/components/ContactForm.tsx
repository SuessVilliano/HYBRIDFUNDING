import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/ui/loading";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // In a real implementation, you would send the form data to an API
      // await apiRequest("POST", "/api/contact", data);
      
      // For now, we'll just simulate a success after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again later or contact us directly via email.",
        variant: "destructive",
      });
      console.error("Error sending contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-accent mb-2">Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="w-full bg-[#0F0F1A] border border-primary/30 focus:border-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-accent mb-2">Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  className="w-full bg-[#0F0F1A] border border-primary/30 focus:border-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-accent mb-2">Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={5}
                  className="w-full bg-[#0F0F1A] border border-primary/30 focus:border-accent p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="neon-filled"
          size="xl"
          rounded="full"
          disabled={isSubmitting}
          className="font-['Orbitron'] shadow-glow-accent"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <Loading variant="dots" size="sm" text="" />
              <span>TRANSMITTING...</span>
            </div>
          ) : (
            "SEND MESSAGE"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;
