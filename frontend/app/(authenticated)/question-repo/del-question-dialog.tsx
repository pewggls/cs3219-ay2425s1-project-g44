import { forwardRef } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Question } from './columns';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { categories, complexities } from './data';

interface DelQuestionDialogProps {
  row: Question
  setData?: React.Dispatch<React.SetStateAction<Question[]>>;
  handleClose: () => void;
}

function DelQuestionDialog(props: DelQuestionDialogProps, ref: React.Ref<HTMLDivElement>) {
  const { row, setData, handleClose } = props;

  const apiUrl = process.env.NEXT_PUBLIC_QUESTION_API_BASE_URL;
  async function deleteQuestion(id: number) {
    try {
        const response = await fetch(`${apiUrl}/delete/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
          alert(`An error occurred while deleting the question ${id}. Please try again.`)
          console.error(`Error deleting question: ${id}`);
          return;
        }

        // Update the question list internally
        if (setData) {
          setData((prevQuestions) => {
              // Filter out the deleted question
              const filteredQuestions = prevQuestions.filter((q) => q.id !== id);

              // Update the IDs of the remaining questions
              return filteredQuestions.map((q, index) => ({
                  ...q,
                  id: index + 1 // Reassign ID based on the new order
              }));
          });
        }

        // Close the dialog after succesful deletion
        handleClose();
    } catch (error) {
        alert(`An error occurred while fetching the updated question list.`)
        console.error(`Error while fetching question`);
    }
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='hidden' ref={ref} />
      </DialogTrigger>
      <DialogContent className="laptop:max-w-[75vw] bg-white text-black font-sans rounded-2xl" > {/* we allow onPointerDownOutside onInteractOutside onEscapeKeyDown since the user can just open another delete dialog */}
        <DialogHeader className="items-start">
          <DialogTitle className="font-serif font-normal text-3xl">Delete question {row.id}</DialogTitle>
          <DialogDescription className="font-bold">This action cannot be undone!</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full gap-6 py-4 justify-start">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title" className="">
              Title
            </Label>
            <Input
              id="title"
              defaultValue={row.title}
              disabled
            />
          </div>
          {/* <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="summary" className="">
              Summary
            </Label>
            <Input
              id="summary"
              defaultValue={row.summary}
              disabled
            />
          </div> */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description" className="">
              Description
            </Label>
            <Textarea
              id="description"
              defaultValue={row.description}
              className="max-h-[50vh]"
              disabled
            />
          </div>
          <div className="flex flex-row w-full items-center gap-4">
            <Label htmlFor="complexity" className="">
              Complexity
            </Label>
            <ToggleGroup 
              type="single"
              variant="complexities" 
              size="xs"
              value={row.complexity}      
              className="bg-gray-200 p-1 rounded-lg"
              disabled
            >
              {complexities.map((complexity) => (
                <ToggleGroupItem key={complexity.value} value={complexity.value}>
                  {complexity.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-row w-full items-start gap-4">
            <Label htmlFor="complexity" className="mt-2">
              Categories
            </Label>
            <ToggleGroup 
              type="multiple" 
              variant="categories" 
              size="xs"
              defaultValue={row.categories}
              className="bg-gray-200 p-1 rounded-lg flex-wrap justify-start w-fit"
              disabled
            >
              {categories.map((category) => (
              <ToggleGroupItem key={category.value} value={category.value}>
                {category.label}
              </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="link" className="">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={row?.link ?? ""}
              placeholder="Link to original question"
              disabled
            />
          </div>
        </div>
        <DialogFooter className="flex items-end">
          <Button type="submit" variant="destructive" className="rounded-lg" onClick={() => deleteQuestion(row.id)}>Delete question</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ForwardedDelQuestionDialog = forwardRef(DelQuestionDialog);
ForwardedDelQuestionDialog.displayName = "DelQuestionDialog";

export default ForwardedDelQuestionDialog;