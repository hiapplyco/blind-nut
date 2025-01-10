import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const candidates = [
  {
    id: 1,
    name: "Alex Johnson",
    title: "Senior Software Engineer",
    location: "San Francisco, CA",
    relevance: 95,
  },
  {
    id: 2,
    name: "Sarah Chen",
    title: "Full Stack Developer",
    location: "New York, NY",
    relevance: 88,
  },
  {
    id: 3,
    name: "Michael Brown",
    title: "Frontend Engineer",
    location: "Austin, TX",
    relevance: 82,
  },
];

const CandidateTable = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Top Candidates</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Relevance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.title}</TableCell>
              <TableCell>{candidate.location}</TableCell>
              <TableCell>{candidate.relevance}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CandidateTable;