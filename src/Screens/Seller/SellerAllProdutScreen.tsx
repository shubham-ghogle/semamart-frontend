import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { Product } from "../../Types/types";
import { TableBodyCell, TableHeader, TableImageCell, TableWrapper } from "../../components/UI/Table";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router";
import { getProductsForSeller, useCustomEnsureQuerty } from "./Seller.Hooks";
import { formatDate } from "../../components/UI/Inputs";

const headers = [
  "Product Name",
  "Image",
  "status",
  "Stock",
  "Original Price",
  "Discounted Price",
  "Date Added",
  "Actions"
];

export default function SellerAllProductsScreen() {
  const { seller } = useSellerStore((state) => state);
  const { data, status } = useCustomEnsureQuerty<Product[]>(["seller-products", seller?._id], () => getProductsForSeller(seller?._id), seller?._id)

  const errMess = "Something went wrong"

  return <SellerMainWrapper status={status} errorMeassage={errMess} heading="Products">
    {data && (
      <TableWrapper>
        <TableHeader headers={headers} />
        <tbody>
          {data.map(pro => (
            <tr key={pro._id}>
              <TableBodyCell text={pro.name} />
              <TableImageCell src={"/baseUrl" + "/" + pro.images[0]} />
              <TableBodyCell text="staus" />
              <TableBodyCell text={pro.stock.toString()} />
              <TableBodyCell text={pro.originalPrice.toString()} />
              <TableBodyCell text={pro.discountPrice.toString()} />
              <TableBodyCell text={formatDate(pro.createdAt)} />
              <td align="center">
                <button>
                  <Link to={"view/" + pro._id}>
                    <AiOutlineEye size={20} />
                  </Link>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    )}
  </SellerMainWrapper>
}
