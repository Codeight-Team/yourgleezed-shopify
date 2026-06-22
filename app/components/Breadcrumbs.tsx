import {Fragment} from 'react';
import {NavLink} from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({items, className}: BreadcrumbsProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/" className="!text-muted-foreground">
              Home
            </NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <Fragment key={item.url}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <NavLink to={item.url}>{item.name}</NavLink>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
