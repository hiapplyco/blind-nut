import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const companies = [
  {
    id: 1,
    name: "TechCorp Inc",
    industry: "Software",
    size: "1000-5000",
    location: "San Francisco, CA",
  },
  {
    id: 2,
    name: "DataFlow Systems",
    industry: "Data Analytics",
    size: "500-1000",
    location: "Boston, MA",
  },
  {
    id: 3,
    name: "Cloud Solutions Pro",
    industry: "Cloud Computing",
    size: "100-500",
    location: "Seattle, WA",
  },
];

const CompanyTable = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Target Companies</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>{company.industry}</TableCell>
              <TableCell>{company.size}</TableCell>
              <TableCell>{company.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CompanyTable;