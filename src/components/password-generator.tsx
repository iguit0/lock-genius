import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { z } from 'zod';

import { Icons } from './icons';
import { ShineBorder } from './magicui/shine-border';
import { BorderBeam } from './magicui/border-beam';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useToast } from './ui/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCopyToClipboard } from '@/hooks/use-copy-clipboard';
import { usePasswordStorage } from '@/hooks/use-password-storage';
import { generatePassword } from '@/services/password/password.service';

const formSchema = z.object({
  length: z.number().min(4).max(255),
  uppercase: z.boolean(),
  lowercase: z.boolean(),
  numbers: z.boolean(),
  symbols: z.boolean(),
});

export default function PasswordGenerator() {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { toast } = useToast();
  const [copy] = useCopyToClipboard();
  const { savePassword } = usePasswordStorage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { password } = await generatePassword({
        params: {
          length: values.length,
          lowercase: values.lowercase,
          numbers: values.numbers,
          symbols: values.symbols,
          uppercase: values.uppercase,
        },
      });

      setGeneratedPassword(password);

      // Save generated password
      await savePassword({
        password,
        length: values.length,
        uppercase: values.uppercase,
        lowercase: values.lowercase,
        numbers: values.numbers,
        symbols: values.symbols,
      });

      toast({
        title: '✨ Password generated',
        description: 'Your new password has been generated and saved!',
        variant: 'success',
      });
    } catch (err) {
      const error = err as AxiosError<{ detail: string }>;
      console.log(err);
      toast({
        title: 'Fail to generate password',
        description: error.response?.data?.detail || error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCopyToClipboard = () => {
    copy(generatedPassword)
      .then(() => {
        toast({
          title: '🎉 Copied to clipboard',
          description: generatedPassword,
          variant: 'success',
        });
      })
      .catch((error) => {
        toast({
          title: '😓 Fail to copy to clipboard',
          description: error,
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="relative w-full max-w-2xl">
      <Card className="relative w-full max-w-2xl">
        <ShineBorder
          borderWidth={1}
          duration={16}
          shineColor={['#3b82f6', '#8b5cf6', '#06b6d4']}
        />
        <CardHeader className="mb-3 space-y-2">
          <CardTitle className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Password Generator
          </CardTitle>
          <CardDescription>
            Generate a secure password based on selected options.
          </CardDescription>
        </CardHeader>

        <Separator className="my-1" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="mt-2 space-y-8 p-8">
              <div className="flex w-full items-center space-x-2">
                <div
                  className={`relative ${
                    generatedPassword
                      ? 'flex-1'
                      : 'flex-1 max-w-[calc(100%-120px)]'
                  }`}
                >
                  <Input
                    id="password"
                    type="text"
                    placeholder="🔑  Your new password will appear here..."
                    readOnly
                    value={generatedPassword}
                    className="hover:cursor-pointer focus-visible:outline-hidden focus-visible:ring-0 w-full"
                    onClick={(e) => {
                      if (!generatedPassword) {
                        return;
                      }
                      e.stopPropagation();
                      handleCopyToClipboard();
                    }}
                  />
                  {generatedPassword && (
                    <BorderBeam
                      size={40}
                      initialOffset={20}
                      colorFrom="#6444d5"
                      colorTo="#6d65fe"
                      borderWidth={2}
                      transition={{
                        type: 'spring',
                        stiffness: 60,
                        damping: 20,
                      }}
                    />
                  )}
                </div>
                {!generatedPassword ? (
                  <Button
                    id="generate"
                    variant="default"
                    type="submit"
                    className="min-w-[120px]"
                  >
                    Generate
                  </Button>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          id="generate"
                          variant="ghost"
                          type="submit"
                        >
                          <TooltipContent>Generate</TooltipContent>
                          <Icons.refresh className="size-5" />
                        </Button>
                      </TooltipTrigger>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          id="copy"
                          variant="ghost"
                          onClick={handleCopyToClipboard}
                          disabled={!generatedPassword}
                          type="button"
                        >
                          <TooltipContent>Copy</TooltipContent>
                          <Icons.copy className="size-5" />
                        </Button>
                      </TooltipTrigger>
                    </Tooltip>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="uppercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Uppercase</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>(A-Z)</TooltipContent>
                      </Tooltip>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numbers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Numbers</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>(0-9)</TooltipContent>
                      </Tooltip>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowercase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Lowercase</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>(a-z)</TooltipContent>
                      </Tooltip>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symbols"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormLabel>Symbols</FormLabel>
                        </TooltipTrigger>
                        <TooltipContent>!@#$%^&*</TooltipContent>
                      </Tooltip>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Password Length</FormLabel>
                      <span className="w-12 px-2 py-0.5 text-right text-sm text-muted-foreground select-none">
                        {field.value}
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={4}
                        max={255}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                        className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        aria-label="Password length"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
