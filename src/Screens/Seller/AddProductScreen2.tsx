import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import ProductDetailsForm from "../../components/Seller/ProductDetailsForm";

// const categoriesData = [{ title: "edible" }];

export default function AddProductScreen2() {

  return (
    <SellerMainWrapper heading="Add Product" status="success">
      <ProductDetailsForm mode="add" />
    </SellerMainWrapper >
  );
}
