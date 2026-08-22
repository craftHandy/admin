import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, ImageOff, ExternalLink } from "lucide-react";

export default function HeroSlideView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["hero-slide", id],
        enabled: Boolean(id),
        queryFn: async () => {
            const response = await api.get(`/api/v1/admin/hero-slide/${id}`);
            return response.data?.data ?? response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <h2 className="text-lg font-semibold">Hero slide not found</h2>
                <Button variant="outline" onClick={() => navigate("/hero-slides")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />Back to Hero Slides
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/hero-slides")} className="h-9 w-9 rounded-full border border-border">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.title}</h1>
                        {data.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{data.subtitle}</p>}
                    </div>
                </div>
                <Button onClick={() => navigate(`/hero-slides/${id}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" />Edit
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${data.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {data.active ? "Active" : "Inactive"}
                </span>
                {data.createdDate && (
                    <span>Created: {new Date(data.createdDate).toLocaleString()}</span>
                )}
                {data.modifiedDate && (
                    <span>Modified: {new Date(data.modifiedDate).toLocaleString()}</span>
                )}
            </div>

            {data.backgroundImageUrl ? (
                <div className="rounded-xl overflow-hidden border border-border">
                    <img src={data.backgroundImageUrl} alt="Background" className="w-full h-64 object-cover" />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                    <p className="text-sm">No background image uploaded.</p>
                </div>
            )}

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</h3>
                    <p className="mt-1 text-lg font-medium text-foreground">{data.title}</p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subtitle</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{data.subtitle || "—"}</p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CTA Button</h3>
                    {data.ctaText ? (
                        <Link to={data.ctaLink ?? "/"} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                            {data.ctaText}
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">—</p>
                    )}
                </div>
            </div>
        </div>
    );
}
