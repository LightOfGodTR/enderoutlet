import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional().default("")
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onClose: () => void;
}

export function ReviewForm({ productId, onClose }: ReviewFormProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: ""
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return apiRequest(`/api/reviews`, "POST", {
        productId,
        rating: data.rating,
        comment: data.comment
      });
    },
    onSuccess: () => {
      toast({
        title: "Değerlendirme eklendi",
        description: "Değerlendirmeniz başarıyla kaydedildi."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", productId, "average"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Değerlendirme eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ReviewFormData) => {
    reviewMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ürünü Değerlendir</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puanınız</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (hoveredRating || field.value)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {field.value > 0 && `${field.value} yıldız`}
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yorumunuz (İsteğe Bağlı)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ürün hakkındaki düşüncelerinizi paylaşabilirsiniz... (zorunlu değil)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? "Kaydediliyor..." : "Değerlendirmeyi Gönder"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}