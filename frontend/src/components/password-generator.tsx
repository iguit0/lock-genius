import { useState } from 'react';

import { Icons } from './icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
// import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { useToast } from './ui/use-toast';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-clipboard';
import { generatePassword } from '@/services/password/password.service';

export default function PasswordGenerator() {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const { toast } = useToast();
  const [copiedText, copy] = useCopyToClipboard();

  const handleGeneratePassword = async () => {
    // TODO: implement form validation
    const { password } = await generatePassword({
      params: {
        length: 12,
        lowercase: true,
        numbers: true,
        symbols: true,
        uppercase: true,
      },
    });
    setGeneratedPassword(password);
    toast({
      title: '🎉 Password generated',
      description: 'Your new password has been generated!',
      variant: 'success',
    });
  };

  const handleCopyToClipboard = () => {
    copy(generatedPassword)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description: copiedText,
          variant: 'success',
        });
      })
      .catch((error) => {
        toast({
          title: 'Fail to copy to clipboard',
          description: error,
          variant: 'destructive',
        });
      });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="mb-3 space-y-2">
        <CardTitle className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Password Generator
        </CardTitle>
        <CardDescription>
          Generate a secure password based on selected options
        </CardDescription>
      </CardHeader>

      <Separator className="my-1" />

      <CardContent className="mt-2 space-y-8 p-4">
        <div className="flex items-center space-x-2">
          <Input
            id="password"
            type="text"
            placeholder="🔑 Your generated password will appear here."
            readOnly
            value={generatedPassword}
          />
          <div className="flex items-center justify-between gap-1">
            <Button
              size="icon"
              id="generate"
              variant="ghost"
              onClick={handleGeneratePassword}
            >
              <Icons.refresh className="size-5" />
            </Button>
            <Button
              size="icon"
              id="copy"
              variant="ghost"
              onClick={handleCopyToClipboard}
            >
              <Icons.copy className="size-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 p-4">
          <div className="flex items-center space-x-2">
            <Switch id="uppercase" />
            <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch defaultChecked id="numbers" />
            <Label htmlFor="numbers">Numbers (0-9)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch defaultChecked id="lowercase" />
            <Label htmlFor="lowercase">Lowercase (a-z)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="symbols" />
            <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
          </div>
        </div>

        {/*
        // TODO: implement
        <div className="mt-8 space-y-4">
          <Label className="inline" htmlFor="length">
            Length
          </Label>
          <Slider defaultValue={[10]} id="length" max={20} min={6} />
        </div> */}
      </CardContent>
    </Card>
  );
}
