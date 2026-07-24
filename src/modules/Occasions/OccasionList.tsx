import { ResourceList } from "@/modules/AdminResources/ResourceList";

export default function OccasionList() {
    return (
        <ResourceList
            resourceKey="occasions"
            resourceName="Occasion"
            resourceLabel="Occasion Name"
            resourceDescription="Create and manage occasions for products."
            endpoint="/api/v1/admin/occasion"
        />
    );
}
