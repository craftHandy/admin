import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";

export default function BlogView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["blog", id],
        enabled: Boolean(id),
        queryFn: async () => {
            const res = await api.get(`/api/v1/admin/blog/${id}`);
            return res.data?.data ?? res.data;
        },
    });

    const blogTags = data?.tags ?? [];

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
                <h2 className="text-lg font-semibold">Blog not found</h2>
                <Button variant="outline" onClick={() => navigate("/blogs")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Blogs</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/blogs")} className="h-9 w-9 rounded-full border border-border">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.title}</h1>
                        {data.excerpt && <p className="text-sm text-muted-foreground mt-0.5">{data.excerpt}</p>}
                    </div>
                </div>
                <Button onClick={() => navigate(`/blogs/${id}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" />Edit
                </Button>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${data.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{data.status}</span>
                {blogTags.length > 0 && (
                    <span className="flex items-center gap-1.5">
                        {blogTags.map((tag: any) => (
                            <span key={tag.id} className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">{tag.name}</span>
                        ))}
                    </span>
                )}
                {data.slug && <span><ExternalLink className="inline h-3 w-3 mr-1" />/{data.slug}</span>}
            </div>

            {data.coverImage && (
                <div className="rounded-xl overflow-hidden border border-border">
                    <img src={data.coverImage} alt="Cover" className="w-full object-cover max-h-80" />
                </div>
            )}

            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.content || "" }} />
            </div>
        </div>
    );
}
