import { ResourceList } from "@/modules/AdminResources/ResourceList";

export default function MaterialList() {
    return (
        <ResourceList
            resourceKey="materials"
            resourceName="Material"
            resourceLabel="Material Name"
            resourceDescription="Manage materials used for product creation."
            endpoint="/api/v1/admin/material"
        />
    );
}
