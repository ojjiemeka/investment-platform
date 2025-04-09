
import { Button } from '@/components/ui/button';

export default function BackButton() {

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <>
           <div className="p-4">
                <Button variant="secondary" onClick={handleGoBack} className="flex items-center text-white-600">
                    Back
                </Button>
            </div> 
        </>
    );
}
