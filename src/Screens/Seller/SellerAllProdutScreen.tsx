import { useQueryClient } from "@tanstack/react-query";
import SellerMainWrapper from "../../components/Seller/SellerMainWrapper";
import { useSellerStore } from "../../store/sellerStore";
import { Product } from "../../Types/types";
import { TableBodyCell, TableHeader, TableWrapper } from "../../components/UI/Table";

const headers = [
  "Product Name",
  "Image",
  "Stock",
  "Original Price",
  "Discounted Price",
  "Date Added",
];

export default function SellerAllProductsScreen() {
  const { seller } = useSellerStore((state) => state);
  const qClient = useQueryClient()

  const data = qClient.getQueryData(["seller-products", seller?._id]) as (Product[] | undefined)

  const status = data ? "success" : "error"
  const errMess = "Something went wrong"

  return <SellerMainWrapper status={status} errorMeassage={errMess} heading="Products">
    {data && (
      <TableWrapper>
        <TableHeader headers={headers} />
        <tbody>
          {data.map(pro => (
            <tr key={pro._id}>
              <TableBodyCell text={pro.name} />
              <td align="center"><img src={"/baseUrl" + "/" + pro.images[0]} width={50} /></td>
              <TableBodyCell text={pro.stock.toString()} />
              <TableBodyCell text={pro.originalPrice.toString()} />
              <TableBodyCell text={pro.discountPrice.toString()} />
              <TableBodyCell text={new Date(pro.createdAt).toLocaleDateString("en-IN")} />
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    )}
  </SellerMainWrapper>
}
