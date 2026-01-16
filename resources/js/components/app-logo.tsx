import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <AppLogoIcon className="h-6 w-6 object-contain" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-foreground">Inventaris PTM</span>
            </div>
        </div>
    );
}
