import { OrganizationList } from "@clerk/nextjs";

function CreateOrganizationPage() {
  return (
    <OrganizationList
      hidePersonal={true}
      afterSelectOrganizationUrl="/organization/:id"
      afterCreateOrganizationUrl="/organization/:id"
    />
  );
}
export default CreateOrganizationPage;
