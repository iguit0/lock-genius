import { Icons } from './icons';

// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PasswordGenerator() {
  return (
    <div className="mx-auto max-w-sm p-6">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-bold" htmlFor="password">
          Password
        </label>
        <div className="flex items-center  p-2">
          <input id="password" readOnly type="text" value="some password" />
          <Icons.copy />
        </div>
      </div>
      {/* <div className="mb-4">
        <div className="mb-2">
          <span className="text-sm font-bold">Character set </span>
          <span className="text-red-500">*</span>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary">Uppercase</Badge>
          <Badge variant="secondary">Lowercase</Badge>
          <Badge variant="secondary">Numbers</Badge>
          <Badge variant="secondary">Symbols</Badge>
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-2 flex justify-between">
          <span className="text-sm font-bold">Password length </span>
          <span className="text-red-500">*</span>
        </div>
        <input
          className="h-2 w-full cursor-pointer appearance-none rounded-lg"
          max="32"
          min="0"
          type="range"
        />
      </div> */}
      <div className="mt-4 flex items-center justify-between">
        {/* <Button variant="ghost">Save</Button> */}
        <Button className="w-full">Generate</Button>
      </div>
    </div>
  );
}
