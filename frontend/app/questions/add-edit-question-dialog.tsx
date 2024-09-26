import { forwardRef, useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Question } from './columns';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { categories, complexities } from './data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AddEditQuestionDialogProps {
  row: Question | null;
}

function AddEditQuestionDialog(props: AddEditQuestionDialogProps, ref: React.Ref<HTMLDivElement>) {
  const { row } = props;
  const [complexityValue, setComplexityValue] = useState(row?.complexity ?? "easy");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='hidden' ref={ref} />
      </DialogTrigger>
      <DialogContent className="laptop:max-w-[75vw] bg-white text-black font-sans rounded-2xl">
        <DialogHeader className="items-start">
            <DialogTitle className="font-serif font-normal tracking-tight text-3xl">
            {row?.id ? `Edit question ${row.id}` : "Add new question"}
            </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full gap-4 py-4 justify-start">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title" className="">
              Title
            </Label>
            <Input
              id="title"
              defaultValue={row?.title ?? ""}
              placeholder="Question title"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="summary" className="">
              Summary
            </Label>
            <Input
              id="summary"
              defaultValue={row?.summary ?? ""}
              placeholder="One-line summary"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description" className="">
              Description
            </Label>
            <Textarea
              id="description"
              defaultValue={row?.description ?? ""}
              placeholder="Question description and instructions"
              className="max-h-[50vh]"
            />
          </div>
          <div className="flex flex-row w-full items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-default">
                  <Label htmlFor="complexity" className="cursor-help">
                    Complexity
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-[200px] flex-wrap">Difficulty level of the question, choose one</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ToggleGroup 
              type="single"
              variant="complexities" 
              size="xs"
              value={complexityValue}
              onValueChange={(value) => {
                if (value) setComplexityValue(value);
              }}        
              className="bg-brand-50 p-1 rounded-lg"
            >
              {complexities.map((complexity) => (
                <ToggleGroupItem key={complexity.value} value={complexity.value}>
                  {complexity.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-row w-full items-center gap-4">
            <div className="">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-default">
                    <Label htmlFor="categories" className="cursor-help">
                      Categories
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-[175px] flex-wrap">Question topic(s), choose at least one option</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <ToggleGroup 
              type="multiple" 
              variant="categories" 
              size="xs"
              defaultValue={row?.categories}
              className="bg-brand-50 p-1 rounded-lg flex-wrap justify-start"
            >
              {categories.map((category) => (
              <ToggleGroupItem key={category.value} value={category.value} className="flex-shrink-0">
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
            />
          </div>
        </div>
        <DialogFooter className="flex">
          <Button type="submit" className="rounded-lg bg-brand-700 hover:bg-brand-600">{row ? "Save changes" : "Done"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const ForwardedAddEditQuestionDialog = forwardRef(AddEditQuestionDialog);
ForwardedAddEditQuestionDialog.displayName = "AddEditQuestionDialog";

export default ForwardedAddEditQuestionDialog;
