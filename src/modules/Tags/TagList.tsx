import { ResourceList } from "@/modules/AdminResources/ResourceList";

export default function TagList() {
    return (
        <ResourceList
            resourceKey="tags"
            resourceName="Tag"
            resourceLabel="Tag Name"
            resourceDescription="Manage tags used to label products."
            endpoint="/api/v1/admin/tag"
        />
    );
}
